import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../helpers/jwtHelpers.js";
import config from "../../config/index.js";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { buildUserModules } from "../middleware/auth.js";

const prisma = new PrismaClient();

// Login user and return JWT
async function login(req, res, next) {
  try {
    const { username, password, rememberMe } = req.body;

    // Validate required fields
    if (!username || !password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Username and password are required"
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    const token = jwtHelpers.signToken(
      {
        id: user.id,
        role: user.role?.name,
        is_super_user: user.is_super_user,
      },
      rememberMe ? "30d" : "1d"
    );

    // Set token in httpOnly cookie
    res.cookie("user", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "development" ? "lax" : "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 24 hours
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name,
        is_super_user: user.is_super_user,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get current user info with modules and permissions (protected route)
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    // Use helper function to build modules
    const modules = await buildUserModules(userId);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role?.name || null,
        is_super_user: user.is_super_user,
      },
      modules: modules,
    });
  } catch (error) {
    next(error);
  }
}

// Change password (protected route)
async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Old password is incorrect");
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds)
    );
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}

// Logout user (clear cookie)
async function logout(req, res, next) {
  try {
    res.clearCookie("user");
    res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
}

export { login, getMe, changePassword, logout };
