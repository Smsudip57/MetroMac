import express from "express";
import { exportData, importData, getImportExportConfig } from "../modules/importExport.js";
import multer from "multer";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ];

        if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith(".csv")) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    `Invalid file type. Allowed: XLSX, XLS, CSV. Received: ${file.mimetype}`
                )
            );
        }
    },
});


router.get("/export", exportData);

router.post("/import", upload.single("file"), importData);

router.get("/config/:module", getImportExportConfig);

export default router;
