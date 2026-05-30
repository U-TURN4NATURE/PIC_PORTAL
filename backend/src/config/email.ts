import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────
// Email Transporter Configuration
// Supports Gmail, SendGrid, Mailgun, and generic SMTP
// ─────────────────────────────────────────────────

// Support both EMAIL_* and SMTP_* variable naming conventions
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter ready');
  } catch (error) {
    console.warn('⚠️  Email transporter not configured:', (error as Error).message);
  }
};

export default transporter;
