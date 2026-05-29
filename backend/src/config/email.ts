import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────
// Email Transporter Configuration
// Supports Gmail, SendGrid, Mailgun, and generic SMTP
// ─────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
