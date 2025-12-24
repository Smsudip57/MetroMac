import express from "express";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../helpers/jwtHelpers.js";
import config from "../../config/index.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to build user's module tree with permissions
async function buildUserModules(userId) {
  try {
    // Collect all permissions from role and user-level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role_id: true },
    });

    if (!user) return [];

    let permissionIds = new Set();

    // Get role permissions
    if (user.role_id) {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role_id: user.role_id },
        select: { permission_id: true },
      });
      rolePermissions.forEach((p) => permissionIds.add(p.permission_id));
    }

    // Get user-specific permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: { user_id: userId },
      select: { permission_id: true },
    });
    userPermissions.forEach((p) => permissionIds.add(p.permission_id));

    // Fetch all permission details with their modules
    const permissions = await prisma.permission.findMany({
      where: { id: { in: Array.from(permissionIds) } },
      include: {
        module: {
          include: {
            children: true,
            parent: true,
          },
        },
      },
    });

    // Build module tree with permissions
    const moduleMap = new Map();
    const modules = [];

    // First pass: create all module objects
    permissions.forEach((permission) => {
      if (!moduleMap.has(permission.module_id)) {
        moduleMap.set(permission.module_id, {
          id: permission.module.id,
          name: permission.module.name,
          parent_id: permission.module.parent_id,
          children: [],
          actions: [],
        });
      }
      // Add action if not already present
      if (
        !moduleMap.get(permission.module_id).actions.includes(permission.action)
      ) {
        moduleMap.get(permission.module_id).actions.push(permission.action);
      }
    });

    // Second pass: build hierarchy
    moduleMap.forEach((module, moduleId) => {
      if (!module.parent_id) {
        modules.push(module);
      }
    });

    // Add children to parent modules
    moduleMap.forEach((module, moduleId) => {
      if (module.parent_id && moduleMap.has(module.parent_id)) {
        moduleMap.get(module.parent_id).children.push(module);
      }
    });

    return modules;
  } catch (error) {
    console.error("Error building user modules:", error);
    return [];
  }
}

export const auth =
  (...userRoles) =>
  async (req, res, next) => {
    try {
      const token = req.cookies?.user;
      if (!token) {
        console.log("No token found in cookies");
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      let verifiedUser = jwtHelpers.verifyToken(token, config.jwt_secret_token);

      // Attach basic user info
      req.user = verifiedUser; // Should contain id, role, is_super_user, etc.

      // Fetch and attach user's modules with permissions
      req.user.modules = await buildUserModules(verifiedUser.id);

      // Super users bypass all role checks
      if (verifiedUser.is_super_user) {
        return next();
      }

      // Only check user role for regular users
      const userRole = verifiedUser.role || null;
      if (userRoles.length && !userRoles.includes(userRole)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden access.");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
export { buildUserModules };
