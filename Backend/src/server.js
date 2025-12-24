import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./app/routes/auth.js";
import constantsRoutes from "./app/routes/constants.js";
import permissionsRoutes from "./app/routes/permissions.js";
import userRoutes from "./app/routes/users.js";
import taskRoutes from "./app/routes/tasks.js";
import FileRoutes from "./app/routes/files.js";
import generalSettingsRoutes from "./app/routes/generalsettings.js";
import importExportRoutes from "./app/routes/importExport.js";
import emailRoutes from "./app/routes/emails.js";
import pushNotificationRoutes from "./app/routes/pushNotifications.js";
import ApiError from "./errors/ApiError.js";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Serve static files from the public directory
app.use("/public", express.static("public"));

app.use(
  cors({
    origin:
      process.env.NODE_DEV === "production" ? process.env.CORS_ORIGIN : true,
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "user"],
  })
);
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/public", express.static("public"));
app.use(express.json());
// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/constants", constantsRoutes);
app.use("/api/v1/permissions", permissionsRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/files", FileRoutes);
app.use("/api/v1/general-settings", generalSettingsRoutes);
app.use("/api/v1/import-export", importExportRoutes);
app.use("/api/v1/emails", emailRoutes);
app.use("/api/v1/push", pushNotificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// Global error handler - must be after all routes
app.use((err, req, res, next) => {
  console.error(err);

  // Use ApiError's built-in response handling
  return ApiError.handleResponse(err, res);
});

// Example: Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Example: Prisma test route
app.get("/prisma-test", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ prisma: "connected" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Prisma connection failed", details: err.message });
  }
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to the database");

    // Seed all data on startup (includes quotations, invoices, projects, etc.)
    // await seedSampleQuotations();
    // await seedSampleInvoices();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  }
}

startServer();
