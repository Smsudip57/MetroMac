import { PrismaClient } from "@prisma/client";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import ResponseFormatter from "../../helpers/responseFormater.js";

const prisma = new PrismaClient();

// ==================== ROLE FUNCTIONS ====================

// Create a new role
async function createRole(req, res, next) {
  try {
    const { name, type } = req.body;
    if (!name || name.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Role name is required");
    }
    if (!type || !["internal", "external"].includes(type)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Role type is required and must be 'internal' or 'external'"
      );
    }
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() },
    });
    if (existingRole) {
      throw new ApiError(StatusCodes.CONFLICT, "Role already exists");
    }
    const role = await prisma.role.create({
      data: { name: name.trim(), type },
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
}

// Get all roles
async function getRoles(req, res, next) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search
      ? { name: { contains: search, mode: "insensitive" } }
      : {};
    const [roles, totalCount] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { _count: { select: { users: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.role.count({ where }),
    ]);
    // Ensure type is included in response (it is by default, but for clarity)
    const rolesWithType = roles.map((role) => ({ ...role, type: role.type }));
    res.json({
      success: true,
      data: rolesWithType,
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

// Get single role by ID
async function getRoleById(req, res, next) {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: { select: { users: true } },
      },
    });
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Role not found");
    }
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

// Update role
async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    if (!name || name.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Role name is required");
    }
    if (!type || !["internal", "external"].includes(type)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Role type is required and must be 'internal' or 'external'"
      );
    }
    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingRole) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Role not found");
    }
    const nameExists = await prisma.role.findFirst({
      where: { name: name.trim(), id: { not: parseInt(id) } },
    });
    if (nameExists) {
      throw new ApiError(StatusCodes.CONFLICT, "Role name already exists");
    }
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { name: name.trim(), type },
    });
    res.json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
}

// Delete role
async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { users: true } } },
    });
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Role not found");
    }
    if (role._count.users > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Cannot delete role. ${role._count.users} user(s) are assigned to this role.`
      );
    }
    await prisma.role.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// Bulk delete roles
async function bulkDeleteRoles(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No IDs provided for bulk delete"
      );
    }
    const roles = await prisma.role.findMany({
      where: { id: { in: ids } },
      include: { _count: { select: { users: true } } },
    });
    const blocked = roles.filter((r) => r._count.users > 0);
    if (blocked.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Cannot delete: ${blocked
          .map((r) => r.name)
          .join(", ")} (users assigned)`
      );
    }
    await prisma.role.deleteMany({ where: { id: { in: ids } } });
    res.json({ success: true, message: "Roles deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// ==================== EXPORTS ====================

export {
  // Role functions
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  bulkDeleteRoles,
};
