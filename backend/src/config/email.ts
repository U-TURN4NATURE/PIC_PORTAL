// ─────────────────────────────────────────────────
// Email Config — now using Resend (see email.service.ts)
// This file kept for backward compatibility with server.ts import
// ─────────────────────────────────────────────────

/**
 * No-op: Previously verified the Nodemailer SMTP connection.
 * Email is now sent via Resend API (see services/email.service.ts).
 * Resend does not require a persistent connection to verify.
 */
export const verifyEmailConnection = async (): Promise<void> => {
  if (process.env.RESEND_API_KEY) {
    console.log('✅ Resend email provider configured');
  } else {
    console.warn('⚠️  RESEND_API_KEY not set — emails will not be sent');
  }
};

export default {};
