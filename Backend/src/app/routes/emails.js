import express from "express";
import {
    sendInvoiceEmail,
    sendQuotationEmail,
} from "../modules/email.js";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/permissionChecker.js";

const router = express.Router();

// Apply auth and permission middleware to all email routes
router.use(auth(), checkPermission());

// POST /api/v1/emails/send-invoice - Send invoice with PDF attachment
router.post("/send-invoice", sendInvoiceEmail);

// POST /api/v1/emails/send-quotation - Send quotation with PDF attachment
router.post("/send-quotation", sendQuotationEmail);

export default router;
