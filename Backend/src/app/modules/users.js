import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { UserStatsQueryBuilder } from "../../helpers/usersStatHelper.js";
import { FileManager } from "../../helpers/FilleManager.js";
import config from "../../config/index.js";

const prisma = new PrismaClient();

// Get all users with role (with pagination and search)
async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 10, search, role, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let where = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      // Allow filtering by role id (number) or role name (string)
      if (!isNaN(Number(role))) {
        where.role_id = Number(role);
      } else {
        where.role = { name: { equals: role, mode: "insensitive" } };
      }
    }

    // Filter by role type (internal/external)
    if (type) {
      const roleType = type.toLowerCase();
      if (roleType === "internal" || roleType === "external") {
        where.role = {
          ...where.role,
          type: roleType,
        };
      }
    }

    // Always exclude super users from the list
    const userWhere = { ...where, is_super_user: false };
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        skip,
        take: parseInt(limit),
        include: {
          role: { select: { id: true, name: true, type: true } },
        },
        orderBy: { username: "asc" },
      }),
      prisma.user.count({ where: userWhere }),
    ]);

    //in future if the user who is requesting is a user with permission to access permission module then we will attach the permission tree also
    let usersWithPermissions = users;
    if (req.user && req.user.is_super_user) {
      const modules = await prisma.module.findMany({
        where: { parent_id: null },
        include: {
          permissions: true,
          children: {
            include: {
              permissions: true,
              children: {
                include: {
                  permissions: true,
                  children: {
                    include: { permissions: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      function formatModule(mod) {
        return {
          id: mod.id,
          name: mod.name,
          permissions: mod.permissions.map((p) => ({
            id: p.id,
            action: p.action,
          })),
          children: mod.children?.map(formatModule) || [],
        };
      }
      const allPermissionsTree = modules.map(formatModule);

      // Attach to each user and remove password
      usersWithPermissions = users.map((u) => {
        const { password, ...rest } = u;
        return {
          ...rest,
          permissionsTree: allPermissionsTree,
        };
      });
    }

    // Remove password from all users (for non-superuser case too)
    if (!req.user || !req.user.is_super_user) {
      usersWithPermissions = usersWithPermissions.map((u) => {
        const { password, ...rest } = u;
        return rest;
      });
    }

    res.json({
      success: true,
      data: usersWithPermissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get all permissions for a user (direct, role, department, designation) grouped by module tree
async function getUserPermissions(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    // Fetch user with relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
        userPermissions: { include: { permission: true } },
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Collect all permission ids
    const permIds = new Set();
    user.userPermissions.forEach((up) => permIds.add(up.permission_id));
    user.role?.rolePermissions?.forEach((rp) => permIds.add(rp.permission_id));

    // Fetch all permissions with module info
    const permissions = await prisma.permission.findMany({
      where: { id: { in: Array.from(permIds) } },
      include: {
        module: true,
      },
    });

    // Fetch module tree (for structure)
    const modules = await prisma.module.findMany({
      where: { parent_id: null },
      include: {
        permissions: true,
        children: {
          include: {
            permissions: true,
            children: {
              include: {
                permissions: true,
                children: {
                  include: { permissions: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Helper to filter permissions by allowed ids
    function filterModule(mod) {
      return {
        id: mod.id,
        name: mod.name,
        permissions: mod.permissions
          .filter((p) => permIds.has(p.id))
          .map((p) => ({ id: p.id, action: p.action })),
        children: mod.children?.map(filterModule) || [],
      };
    }
    const userPermissionsTree = modules.map(filterModule);

    res.json({ success: true, data: userPermissionsTree });
  } catch (error) {
    next(error);
  }
}

// Create a new user
async function createUser(req, res, next) {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      defaultLanguage,
      direction,
      facebook,
      linkedin,
      skype,
      profileImage,
      emailSignature,
      twoFactorEnabled = false,
      twoFactorType = "disabled",
      role_id,
      company_name,
      company_address,
    } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    // If role_id is provided, check if it's an external role type
    let finalCompanyName = null;
    let finalCompanyAddress = null;
    let finalProfileImage = profileImage;

    if (role_id) {
      const role = await prisma.role.findUnique({
        where: { id: role_id },
        select: { type: true },
      });

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Invalid role_id provided.",
        });
      }

      // Only allow company fields for external role type
      if (role.type === "external") {
        finalCompanyName = company_name || null;
        finalCompanyAddress = company_address || null;
      } else if (company_name || company_address) {
        // If user provided company fields but role is internal, reject
        return res.status(400).json({
          success: false,
          message:
            "Company fields can only be set for users with external role type.",
        });
      }
    }

    // Handle profile image - move from junk to final location
    if (profileImage) {
      try {
        const processedImage = await FileManager.normal({ url: profileImage });
        finalProfileImage = processedImage.url;
      } catch (imageError) {
        return res.status(400).json({
          success: false,
          message: `Failed to process profile image: ${imageError.message}`,
        });
      }
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds)
    );

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        defaultLanguage,
        direction,
        facebook,
        linkedin,
        skype,
        profileImage: finalProfileImage,
        emailSignature,
        is_super_user: false, // Always false
        is_verified: true,
        twoFactorEnabled,
        twoFactorType,
        role_id,
        company_name: finalCompanyName,
        company_address: finalCompanyAddress,
      },
      include: {
        role: { select: { id: true, name: true, type: true } },
      },
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === "P2002") {
      // Unique constraint failed
      return res
        .status(409)
        .json({ success: false, message: "Username already exists." });
    }
    next(error);
  }
}

// Update an existing user
async function updateUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      defaultLanguage,
      direction,
      facebook,
      linkedin,
      skype,
      profileImage,
      emailSignature,
      is_suspended, // allow updating suspension status
      twoFactorEnabled,
      twoFactorType,
      role_id,
      company_name,
      company_address,
    } = req.body;

    // Only update fields that are provided
    const data = {};
    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email;
    if (password !== undefined) {
      // Hash password using bcrypt before saving
      data.password = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
      );
    }
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (defaultLanguage !== undefined) data.defaultLanguage = defaultLanguage;
    if (direction !== undefined) data.direction = direction;
    if (facebook !== undefined) data.facebook = facebook;
    if (linkedin !== undefined) data.linkedin = linkedin;
    if (skype !== undefined) data.skype = skype;
    if (profileImage !== undefined) {
      // Get current user to check if profileImage has changed
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true },
      });

      // Only process image if it's different from the current one
      if (profileImage !== currentUser?.profileImage) {
        if (profileImage) {
          try {
            const processedImage = await FileManager.normal({
              url: profileImage,
            });
            data.profileImage = processedImage.url;
          } catch (imageError) {
            return res.status(400).json({
              success: false,
              message: `Failed to process profile image: ${imageError.message}`,
            });
          }
        } else {
          data.profileImage = null;
        }
      }
    }
    if (emailSignature !== undefined) data.emailSignature = emailSignature;
    // Do NOT allow updating is_super_user from API
    if (is_suspended !== undefined) {
      data.is_suspended = is_suspended;
      if (is_suspended) {
        data.suspendedAt = new Date();
      } else {
        data.suspendedAt = null;
      }
    }
    if (twoFactorEnabled !== undefined)
      data.twoFactorEnabled = twoFactorEnabled;
    if (twoFactorType !== undefined) data.twoFactorType = twoFactorType;
    if (role_id !== undefined) data.role_id = role_id;

    // Handle company fields - only for external role type
    if (company_name !== undefined || company_address !== undefined) {
      // Get the user's current role or the new role being set
      const targetRoleId =
        role_id !== undefined
          ? role_id
          : (
              await prisma.user.findUnique({
                where: { id: userId },
                select: { role_id: true },
              })
            )?.role_id;

      if (targetRoleId) {
        const role = await prisma.role.findUnique({
          where: { id: targetRoleId },
          select: { type: true },
        });

        if (!role) {
          return res.status(400).json({
            success: false,
            message: "Invalid role_id provided.",
          });
        }

        // Only allow company fields for external role type
        if (role.type === "external") {
          if (company_name !== undefined) data.company_name = company_name;
          if (company_address !== undefined)
            data.company_address = company_address;
        } else {
          // If user is trying to set company fields on non-external role, reject
          // return res.status(400).json({
          //   success: false,
          //   message:
          //     "Company fields can only be set for users with external role type.",
          // });
        }
      } else {
        // No role assigned, cannot set company fields
        return res.status(400).json({
          success: false,
          message:
            "Cannot set company fields for user without an assigned role.",
        });
      }
    }

    // Security check: prevent non-superadmin users from changing their own role/suspension status
    if (req.user.id === userId && !req.user.is_super_user) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role_id: true, is_suspended: true },
      });

      // Only block if they're trying to change these fields AND the values are different
      if (
        (role_id !== undefined && role_id !== currentUser.role_id) ||
        (is_suspended !== undefined &&
          is_suspended !== currentUser.is_suspended)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot change your own role/suspension status. Contact an administrator.",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        role: { select: { id: true, name: true, type: true } },
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Username or email already exists." });
    }
    next(error);
  }
}

// Delete a user
async function deleteUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }
    // Check if user is super user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.is_super_user) {
      return res
        .status(403)
        .json({ success: false, message: "Super user cannot be deleted." });
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// Get user statistics and analytics
async function getUserStats(req, res, next) {
  try {
    const { role, type, breakdown = "true" } = req.query;
    const includeBreakdown = breakdown === "true";

    const queryBuilder = new UserStatsQueryBuilder(prisma);
    const baseWhere = queryBuilder.buildBaseWhere({ role, type });

    // Get basic stats (always needed)
    const basicStats = await queryBuilder.getBasicStats(baseWhere);
    const result = queryBuilder.formatStatsWithChanges(
      basicStats.current,
      basicStats.historical
    );

    // Helper to ensure negative sign for decrements, always number
    function signedChange(current, previous) {
      if (typeof current !== "number" || typeof previous !== "number") return 0;
      if (previous === 0) return current === 0 ? 0 : 100;
      const change = ((current - previous) / Math.abs(previous)) * 100;
      return Number(change.toFixed(2));
    }

    // Add breakdown stats if requested and no specific role
    if (!role && includeBreakdown) {
      const promises = [];

      if (!type || type === "internal") {
        promises.push(queryBuilder.getTypeBreakdownStats("internal"));
      }

      if (!type || type === "external") {
        promises.push(queryBuilder.getTypeBreakdownStats("external"));
      }

      const breakdownResults = await Promise.all(promises);
      let breakdownIndex = 0;

      if (!type || type === "internal") {
        const internalStats = breakdownResults[breakdownIndex++];
        const formatted = queryBuilder.formatTypeStats(
          internalStats.current,
          internalStats.historical,
          "internal"
        );
        // Patch: ensure change fields are signed numbers
        if (formatted && typeof formatted.percentageChange === "number") {
          formatted.percentageChange = signedChange(
            internalStats.current?.totalUsers ?? 0,
            internalStats.historical?.totalUsers ?? 0
          );
        }
        result.internal = formatted;
      }

      if (!type || type === "external") {
        const externalStats = breakdownResults[breakdownIndex++];
        const formatted = queryBuilder.formatTypeStats(
          externalStats.current,
          externalStats.historical,
          "external"
        );
        if (formatted && typeof formatted.percentageChange === "number") {
          formatted.percentageChange = signedChange(
            externalStats.current?.totalUsers ?? 0,
            externalStats.historical?.totalUsers ?? 0
          );
        }
        result.external = formatted;
      }
    }

    // Add absolute total if no type filter
    if (!type) {
      const absoluteStats = await queryBuilder.getAbsoluteTotalStats();
      result.absoluteTotalUsers = absoluteStats.absoluteTotalUsers;
      result.absoluteTotalUsersChange = signedChange(
        absoluteStats.absoluteTotalUsers,
        absoluteStats.absoluteTotalUsers30DaysAgo
      );
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export {
  getUsers,
  getUserPermissions,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
};
