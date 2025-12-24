import express from "express";
import {
  // Role functions
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  bulkDeleteRoles,
} from "../modules/constants.js";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/permissionChecker.js";

const router = express.Router();

// ==================== ROLE ROUTES ====================

router.use("/roles", auth(), checkPermission("User List"));

// GET /api/constants/roles/get - Get all roles with pagination and search
router.get("/roles/get", getRoles);

// GET /api/constants/roles/get/:id - Get single role by ID
router.get("/roles/get/:id", getRoleById);

// POST /api/constants/roles/create - Create new role
router.post("/roles/create", checkPermission("Roles & Permissions"), createRole);

// POST /api/constants/roles/bulk-delete - Bulk delete roles
router.post("/roles/bulk-delete", checkPermission("Roles & Permissions"), bulkDeleteRoles);

// PUT /api/constants/roles/edit/:id - Update role
router.put("/roles/edit/:id", checkPermission("Roles & Permissions"), updateRole);

// DELETE /api/constants/roles/delete/:id - Delete role
router.delete("/roles/delete/:id", checkPermission("Roles & Permissions"), deleteRole);

export default router;
