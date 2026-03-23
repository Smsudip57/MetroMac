import { saveTempFile } from "../modules/files.js";
import express from "express";
import multer from "multer";
import { handleMulterError } from "../middleware/multerErrorHandler.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
  saveTempFile,
);

export default router;
