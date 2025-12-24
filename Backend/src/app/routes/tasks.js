import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  getTaskAlerts,
  addTaskAlert,
  deleteTaskAlert,
  getTaskStats,
  addTaskComment,
  deleteTaskComment,
  attachAttachmentToTask,
} from "../modules/tasks.js";
import { auth } from "../middleware/auth.js";
import checkPermission from "../middleware/permissionChecker.js";

const router = Router();

// Apply auth middleware to all routes
router.use(auth());

// Task List routes - check "Task List" sub-module permissions
router.get("/get", checkPermission("Task List"), getTasks);
router.get("/stats", checkPermission("Task List"), getTaskStats);
router.post("/bulk-delete", checkPermission("Task List"), bulkDeleteTasks);
router.post("/", checkPermission("Task List"), createTask);
router.get("/:id", checkPermission("Task List"), getTaskById);
router.put("/:id", checkPermission("Task List"), updateTask);
router.delete("/:id", checkPermission("Task List"), deleteTask);

// Task alert routes - check "Task List" sub-module permissions
router.get("/:taskId/alerts", checkPermission("Task List"), getTaskAlerts);
router.post("/:taskId/alerts", checkPermission("Task List"), addTaskAlert);
router.delete(
  "/alerts/:alertId",
  checkPermission("Task List"),
  deleteTaskAlert
);

// Task comment routes - check "Task Comments" sub-module permissions
router.post(
  "/:taskId/comments",
  checkPermission("Task Comments"),
  addTaskComment
);
router.delete(
  "/comments/:commentId",
  checkPermission("Task Comments"),
  deleteTaskComment
);

// Task attachment routes - check "Task List" sub-module permissions
router.post(
  "/:taskId/attachments",
  checkPermission("Task List"),
  attachAttachmentToTask
);

export default router;
