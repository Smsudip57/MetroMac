import { saveTempFile } from "../modules/files.js";
import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/upload", upload.single("file"), saveTempFile);

export default router;
