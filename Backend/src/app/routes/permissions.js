import express from "express";
import {
  setRolePermissions,
  getRolePermissions,
  bulkSetRolePermissions,
  setUserPermissions,
  getAllPermissions,
  bulkSetUserPermissions,
} from "../modules/permissions.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/permissions/all - Get all modules and their permissions (protected)
router.get("/all", auth(), getAllPermissions);

// ==================== ROLE PERMISSIONS ====================
router.post("/roles/:id/permissions", auth(), setRolePermissions);
router.get("/roles/:id/permissions", auth(), getRolePermissions);
router.post("/roles/bulk-permissions", auth(), bulkSetRolePermissions);

// ==================== USER PERMISSIONS ====================
router.post("/users/:id/permissions", auth(), setUserPermissions);
router.post("/users/bulk-permissions", auth(), bulkSetUserPermissions);

export default router;
