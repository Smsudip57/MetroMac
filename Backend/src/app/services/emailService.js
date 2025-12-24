import nodemailer from 'nodemailer';
import ApiError from '../../errors/ApiError.js';

class EmailService {
    constructor() {
        // Configure Nodemailer transporter
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPassword = process.env.SMTP_PASSWORD;

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
            throw new ApiError(
                500,
                'Email configuration incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD',
                'Email service configuration error'
            );
        }

        this.transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort == 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });

        this.defaultFromEmail = process.env.EMAIL_FROM || smtpUser;
        this.defaultFromName = process.env.EMAIL_FROM_NAME || 'CodeCar';
    }

    async sendEmail(options) {
        try {
            // Validate required fields
            if (!options.to || !options.subject || !options.html) {
                throw new ApiError(
                    400,
                    'Missing required fields: to, subject, html',
                    'Invalid email options'
                );
            }

            // Build from address
            const fromName = options.fromName || this.defaultFromName;
            const fromEmail = options.from || this.defaultFromEmail;
            const fromAddress = `${fromName} <${fromEmail}>`;

            // Build email payload
            const mailOptions = {
                from: fromAddress,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || undefined, // Plain text version (optional)
            };

            // Add attachments if provided
            if (options.attachments && options.attachments.length > 0) {
                mailOptions.attachments = options.attachments;
            }

            // Send email via Nodemailer
            const info = await this.transporter.sendMail(mailOptions);

            console.log(`Email sent successfully. Message ID: ${info.messageId}`);
            return {
                success: true,
                messageId: info.messageId,
                message: 'Email sent successfully',
            };
        } catch (error) {
            console.error('Email service error:', error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                500,
                error.message || 'Failed to send email',
                'Email service error'
            );
        }
    }

    // Method to verify email configuration
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service connected successfully');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
