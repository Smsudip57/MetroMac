import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

// ==================== ROLE PERMISSION FUNCTIONS ====================

// Assign or update permissions for a specific role
async function setRolePermissions(req, res, next) {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // array of permission IDs
    if (!Array.isArray(permissions)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Permissions must be an array" });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!role) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Role not found" });
    }

    await prisma.rolePermission.deleteMany({
      where: { role_id: parseInt(id) },
    });
    const data = permissions.map((pid) => ({
      role_id: parseInt(id),
      permission_id: pid,
    }));
    if (data.length > 0) {
      await prisma.rolePermission.createMany({ data });
    }
    res.json({ success: true, message: "Permissions updated for role" });
  } catch (error) {
    next(error);
  }
}

// Get permission tree for a specific role
async function getRolePermissions(req, res, next) {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!role) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Role not found" });
    }

    // Get all permission IDs assigned to this role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role_id: parseInt(id) },
      select: { permission_id: true },
    });
    const permIds = new Set(rolePermissions.map((p) => p.permission_id));

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
    const rolePermissionsTree = modules.map(filterModule);

    res.json({ success: true, data: rolePermissionsTree });
  } catch (error) {
    next(error);
  }
}

// Bulk overwrite permissions for multiple roles
async function bulkSetRolePermissions(req, res, next) {
  try {
    const { items } = req.body; // [{ id, permissions: [permissionId, ...] }]
    if (!Array.isArray(items)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Items must be an array" });
    }
    for (const item of items) {
      await prisma.rolePermission.deleteMany({
        where: { role_id: parseInt(item.id) },
      });
      const data = (item.permissions || []).map((pid) => ({
        role_id: parseInt(item.id),
        permission_id: pid,
      }));
      if (data.length > 0) {
        await prisma.rolePermission.createMany({ data });
      }
    }
    res.json({
      success: true,
      message: "Bulk role permissions updated",
    });
  } catch (error) {
    next(error);
  }
}

// ==================== USER PERMISSION FUNCTIONS ====================

// Assign or update permissions for a specific user
async function setUserPermissions(req, res, next) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Permissions must be an array" });
    }
    await prisma.userPermission.deleteMany({
      where: { user_id: parseInt(id) },
    });
    const data = permissions.map((pid) => ({
      user_id: parseInt(id),
      permission_id: pid,
    }));
    if (data.length > 0) {
      await prisma.userPermission.createMany({ data });
    }
    res.json({ success: true, message: "Permissions updated for user" });
  } catch (error) {
    next(error);
  }
}

// Bulk overwrite permissions for multiple users
async function bulkSetUserPermissions(req, res, next) {
  try {
    const { items } = req.body; // [{ id, permissions: [permissionId, ...] }]
    if (!Array.isArray(items)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Items must be an array" });
    }
    for (const item of items) {
      await prisma.userPermission.deleteMany({
        where: { user_id: parseInt(item.id) },
      });
      const data = (item.permissions || []).map((pid) => ({
        user_id: parseInt(item.id),
        permission_id: pid,
      }));
      if (data.length > 0) {
        await prisma.userPermission.createMany({ data });
      }
    }
    res.json({
      success: true,
      message: "Bulk user permissions updated",
    });
  } catch (error) {
    next(error);
  }
}

// Get all modules and their available permissions (flat, with parent/child structure)
async function getAllPermissions(req, res, next) {
  try {
    // Fetch all modules with their permissions and children recursively
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

    // Helper to format module tree recursively
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

    const result = modules.map(formatModule);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export {
  setRolePermissions,
  getRolePermissions,
  bulkSetRolePermissions,
  setUserPermissions,
  bulkSetUserPermissions,
  getAllPermissions,
};
