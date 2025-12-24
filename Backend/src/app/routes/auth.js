import express from "express";
import { login, getMe, changePassword, logout } from "../modules/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/me", auth(), getMe);
router.patch("/change-password", auth(), changePassword);

export default router;
