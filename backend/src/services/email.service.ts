import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────
// Email Service — Powered by Nodemailer
// Uses standard SMTP (e.g., Gmail, Hostinger, AWS SES)
// ─────────────────────────────────────────────────

const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'hello@example.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'U-Turn4Nature';
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`;

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_FROM_ADDRESS,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10-second timeout so the frontend doesn't spin forever if blocked
});

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>U-Turn4Nature</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #F5F0E8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #FAFAF7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(45,80,22,0.10); }
    .header { background: linear-gradient(135deg, #2D5016 0%, #6B7C3A 100%); padding: 36px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .header p { color: #C9A84C; margin: 6px 0 0; font-size: 14px; }
    .body { padding: 40px; }
    .body h2 { color: #2D5016; font-size: 22px; margin: 0 0 16px; }
    .body p { color: #4a5568; line-height: 1.7; margin: 0 0 16px; }
    .otp-box { background: linear-gradient(135deg, #2D5016 0%, #6B7C3A 100%); color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 12px; margin: 24px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2D5016 0%, #6B7C3A 100%); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0; }
    .info-box { background: #f0f7ed; border-left: 4px solid #2D5016; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .footer { background: #2D5016; color: #A8B89A; text-align: center; padding: 24px 40px; font-size: 13px; }
    .footer a { color: #C9A84C; text-decoration: none; }
    .gold { color: #C9A84C; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 U-Turn4Nature</h1>
      <p>PIC Partner Portal</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} U-Turn4Nature. All rights reserved.</p>
      <p><a href="https://u-turn.in">u-turn.in</a></p>
    </div>
  </div>
</body>
</html>
`;

// ─── Helper to send via Nodemailer ───────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const pass = process.env.SMTP_PASS;
  if (!pass) {
    console.warn('⚠️  SMTP_PASS not set — email not sent to:', to);
    return;
  }
  
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error: any) {
    console.error('❌ Nodemailer email error:', error);
    throw new Error(error.message);
  }
}


/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (email: string, name: string, otp: string): Promise<void> => {
  await sendEmail(
    email,
    '🌿 Verify Your Email — U-Turn4Nature PIC Portal',
    baseTemplate(`
      <h2>Welcome, ${name}! 🌱</h2>
      <p>Thank you for applying to become a <strong class="gold">PIC Partner</strong> with U-Turn4Nature.</p>
      <p>Please use the OTP below to verify your email address:</p>
      <div class="otp-box">${otp}</div>
      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <hr class="divider">
      <p>Once you verify your email, your application will be reviewed by our admin team. You will be notified once approved.</p>
    `)
  );
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, name: string, resetUrl: string, otp: string): Promise<void> => {
  await sendEmail(
    email,
    '🔐 Reset Your Password — U-Turn4Nature PIC Portal',
    baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <div style="text-align:center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <br />
      <p>Alternatively, if you need an OTP, use this code:</p>
      <div class="otp-box">${otp}</div>
      <p>This link and OTP expire in <strong>1 hour</strong>.</p>
      <div class="info-box">
        <p style="margin:0;">If you didn't request this, please ignore this email. Your password will not change.</p>
      </div>
    `)
  );
};

/**
 * Send PIC approval notification email
 */
export const sendApprovalEmail = async (email: string, name: string, referralCode: string): Promise<void> => {
  const referralLink = `${process.env.REFERRAL_BASE_URL || 'https://u-turn.in'}/?ref=${referralCode}`;
  await sendEmail(
    email,
    '🎉 Congratulations! Your PIC Application is Approved',
    baseTemplate(`
      <h2>You're Now a PIC Partner! 🎊</h2>
      <p>Hi ${name},</p>
      <p>We're thrilled to welcome you to the <strong class="gold">U-Turn4Nature PIC Partner Program</strong>!</p>
      <div class="info-box">
        <p style="margin:0 0 8px;"><strong>Your Referral Code:</strong> <span class="gold" style="font-size:20px;">${referralCode}</span></p>
        <p style="margin:0;"><strong>Your Referral Link:</strong><br>${referralLink}</p>
      </div>
      <p>Share your referral link and earn <strong class="gold">5% commission</strong> on every successful order.</p>
      <div style="text-align:center;">
        <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Your Dashboard</a>
      </div>
    `)
  );
};

/**
 * Send PIC rejection notification email
 */
export const sendRejectionEmail = async (email: string, name: string, reason?: string): Promise<void> => {
  await sendEmail(
    email,
    'Update on Your PIC Application — U-Turn4Nature',
    baseTemplate(`
      <h2>Application Status Update</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in the U-Turn4Nature PIC Partner Program.</p>
      <p>After careful review, we're unable to approve your application at this time.</p>
      ${reason ? `<div class="info-box"><p style="margin:0;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
      <p>You may reapply after 30 days or contact our support team for more information.</p>
    `)
  );
};

/**
 * Send new commission notification email
 */
export const sendCommissionEmail = async (
  email: string,
  name: string,
  orderAmount: number,
  commission: number,
  orderId: string
): Promise<void> => {
  await sendEmail(
    email,
    `💰 You earned ₹${commission.toFixed(2)} commission — U-Turn4Nature`,
    baseTemplate(`
      <h2>New Commission Earned! 💸</h2>
      <p>Hi ${name},</p>
      <p>Great news! A customer used your referral link and made a purchase.</p>
      <div class="info-box">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${orderId}</p>
        <p style="margin:0 0 8px;"><strong>Order Amount:</strong> ₹${orderAmount.toFixed(2)}</p>
        <p style="margin:0;"><strong>Your Commission (5%):</strong> <span class="gold" style="font-size:18px;">₹${commission.toFixed(2)}</span></p>
      </div>
      <p>Your wallet has been updated. Keep sharing your referral link to earn more!</p>
      <div style="text-align:center;">
        <a href="${process.env.FRONTEND_URL}/dashboard/wallet" class="btn">View Your Wallet</a>
      </div>
    `)
  );
};

/**
 * Send payout processed email
 */
export const sendPayoutEmail = async (email: string, name: string, amount: number): Promise<void> => {
  await sendEmail(
    email,
    `✅ Payout of ₹${amount.toFixed(2)} Processed — U-Turn4Nature`,
    baseTemplate(`
      <h2>Payout Processed! ✅</h2>
      <p>Hi ${name},</p>
      <p>Your payout request has been processed successfully.</p>
      <div class="info-box">
        <p style="margin:0;"><strong>Amount Paid:</strong> <span class="gold" style="font-size:20px;">₹${amount.toFixed(2)}</span></p>
      </div>
      <p>The amount will reflect in your bank account / UPI within 2–3 business days.</p>
      <div style="text-align:center;">
        <a href="${process.env.FRONTEND_URL}/dashboard/wallet" class="btn">View Wallet History</a>
      </div>
    `)
  );
};
