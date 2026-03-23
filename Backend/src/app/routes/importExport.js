import express from "express";
import {
  exportData,
  importData,
  getImportExportConfig,
} from "../modules/importExport.js";
import { auth } from "../middleware/auth.js";
import multer from "multer";
import { handleMulterError } from "../middleware/multerErrorHandler.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed: XLSX, XLS, CSV. Received: ${file.mimetype}`,
        ),
      );
    }
  },
});

router.get("/export", auth(), exportData);

router.post(
  "/import",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
  importData,
);

router.get("/config/:module", getImportExportConfig);

export default router;
