/**
 * Email Module
 * Contains all business logic for email operations
 * Functions accept (req, res, next) like standard Express handlers
 */

import emailService from '../services/emailService.js';
import ApiError from '../../errors/ApiError.js';
import ResponseFormatter from '../../helpers/responseFormater.js';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Send invoice email with PDF
 * POST /api/v1/emails/send-invoice
 * Body: { invoiceId, pdfBuffer (base64), recipientEmail?, message? }
 */
export async function sendInvoiceEmail(req, res, next) {
    try {
        const { invoiceId, pdfBuffer, recipientEmail, message } = req.body;

        // Validate required fields
        if (!invoiceId || !pdfBuffer) {
            throw new ApiError(400, 'Missing required fields: invoiceId, pdfBuffer');
        }

        // Fetch invoice with customer data
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(invoiceId) },
            include: {
                customer: true,
            },
        });

        if (!invoice) {
            throw new ApiError(404, `Invoice with ID ${invoiceId} not found`);
        }

        // Validate email
        const toEmail = recipientEmail || invoice.customer?.email;
        if (!toEmail) {
            throw new ApiError(
                400,
                'No email address found for invoice customer'
            );
        }

        // Convert base64 string to Buffer
        const buffer = Buffer.from(pdfBuffer, 'base64');

        // Send email
        const result = await emailService.sendInvoiceEmail({
            to: toEmail,
            customerName: invoice.customer?.firstName || 'Valued Customer',
            invoiceNumber: invoice.invoice_number,
            pdfBuffer: buffer,
            message: message || 'Please find your invoice attached.',
        });

        return ResponseFormatter.success(
            res,
            {
                success: true,
                messageId: result.messageId,
                sentTo: toEmail,
                invoiceNumber: invoice.invoice_number,
            },
            'Invoice email sent successfully',
            StatusCodes.OK
        );
    } catch (error) {
        next(error);
    }
}

/**
 * Send quotation email with PDF
 * POST /api/v1/emails/send-quotation
 * Body: { quotationId, pdfBuffer (base64), recipientEmail?, message? }
 */
export async function sendQuotationEmail(req, res, next) {
    try {
        const { quotationId, pdfBuffer, recipientEmail, message } = req.body;

        // Validate required fields
        if (!quotationId || !pdfBuffer) {
            throw new ApiError(400, 'Missing required fields: quotationId, pdfBuffer');
        }

        // Fetch quotation with customer data
        const quotation = await prisma.quotation.findUnique({
            where: { id: parseInt(quotationId) },
            include: {
                customer: true,
            },
        });

        if (!quotation) {
            throw new ApiError(404, `Quotation with ID ${quotationId} not found`);
        }

        // Validate email
        const toEmail = recipientEmail || quotation.customer?.email;
        if (!toEmail) {
            throw new ApiError(
                400,
                'No email address found for quotation customer'
            );
        }

        // Convert base64 string to Buffer
        const buffer = Buffer.from(pdfBuffer, 'base64');

        // Send email
        const result = await emailService.sendQuotationEmail({
            to: toEmail,
            customerName: quotation.customer?.firstName || 'Valued Customer',
            quotationNumber: quotation.quotation_number,
            pdfBuffer: buffer,
            message: message || 'Please find your quotation attached.',
        });

        return ResponseFormatter.success(
            res,
            {
                success: true,
                messageId: result.messageId,
                sentTo: toEmail,
                quotationNumber: quotation.quotation_number,
            },
            'Quotation email sent successfully',
            StatusCodes.OK
        );
    } catch (error) {
        next(error);
    }
}
