import express from "express";
import {
  getUsers,
  getUserPermissions,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
} from "../modules/users.js";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/permissionChecker.js";

const router = express.Router();

// Apply auth and permission middleware to all user routes
router.use(auth(), checkPermission("User List"));

// GET /api/users/get - Get all users with pagination and search
router.get("/get", getUsers);

// GET /api/users/stats - Get user statistics and analytics
router.get("/stats", getUserStats);

// POST /api/users - Create a new user
router.post("/", createUser);

// PUT /api/users/:id - Update a user
router.put("/:id", updateUser);

// DELETE /api/users/:id - Delete a user
router.delete("/:id", deleteUser);

// GET /api/users/:id/permissions - Get all permissions for a user
router.get("/:id/permissions", getUserPermissions);

export default router;
