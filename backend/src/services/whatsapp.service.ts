// ─────────────────────────────────────────────────
// WhatsApp Service — Powered by Bhash SMS
// Template: pic_portal_otp (AUTHENTICATION type)
// API: stype=auth with OTP as Params
// Correct endpoint: sendmsgutil.php (NOT sendmsg.php)
// ─────────────────────────────────────────────────

const BHASH_BASE_URL = 'http://bhashsms.com/api/sendmsgutil.php';
const BHASH_USER = process.env.BHASH_USER || '';
const BHASH_PASS = process.env.BHASH_PASS || '';
const BHASH_SENDER = process.env.BHASH_SENDER || 'BUZWAP';
const BHASH_TEMPLATE = process.env.BHASH_WA_OTP_TEMPLATE || 'pic_portal_otp';

/**
 * Strip country code (91) from an Indian phone number.
 * Bhash requires phone numbers WITHOUT the country code.
 * Accepts: "917701818405", "917701818405", "7701818405", "+917701818405"
 */
function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If it starts with 91 and is 12 digits, strip the 91
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Send a WhatsApp Authentication OTP via Bhash SMS
 *
 * API: GET http://bhashsms.com/api/sendmsgutil.php
 * Uses stype=auth (Authentication OTP flow) and the approved template
 *
 * Template text: "{{1}} is your verification code for PIC Portal.
 *                 For your security, do not share this code."
 * Bhash replaces {{1}} with the OTP passed as Params
 *
 * IMPORTANT: The template must be approved as "Authentication" category
 * on BhashSMS panel before this will work.
 */
export const sendWhatsAppOTP = async (phone: string, otp: string): Promise<void> => {
  if (!BHASH_USER || !BHASH_PASS) {
    console.warn('⚠️  BHASH_USER or BHASH_PASS not set — WhatsApp OTP not sent to:', phone);
    return;
  }

  const formattedPhone = formatPhone(phone);

  const params = new URLSearchParams({
    user: BHASH_USER,
    pass: BHASH_PASS,
    sender: BHASH_SENDER,
    phone: formattedPhone,
    text: BHASH_TEMPLATE,
    priority: 'wa',
    stype: 'auth',   // ✅ FIXED: Must be 'auth' for OTP/Authentication templates
    Params: otp,
  });

  const url = `${BHASH_BASE_URL}?${params.toString()}`;

  console.log(`📱 Sending WhatsApp OTP to: ${formattedPhone} via ${BHASH_BASE_URL}`);

  const response = await fetch(url);
  const responseText = await response.text();
  const trimmedResponse = responseText.trim();

  console.log(`📨 Bhash API response for ${formattedPhone}: "${trimmedResponse}"`);

  // ── Response Classification ───────────────────────────────────────────────
  // BhashSMS returns plain-text responses. Known responses:
  //   Success:   "Sent" or a numeric message ID
  //   Auth fail: "Error" / "Invalid User and Password"
  //   No credit: "No Sufficient Credits"
  //   Template:  "Only Utility or Authentication Templates Supported/SplitCredits Not Activated"
  //   Rate limit: "Daily Limit Crossed"

  const lower = trimmedResponse.toLowerCase();

  if (lower.includes('only utility or authentication') || lower.includes('splitcredits not activated')) {
    throw new Error(
      `WhatsApp OTP failed: Template "${BHASH_TEMPLATE}" is not approved as Authentication/Utility type on BhashSMS panel, ` +
      `or SplitCredits is not activated. Please contact BhashSMS support. Raw: ${trimmedResponse}`
    );
  }

  if (lower.startsWith('error') || lower.includes('invalid user')) {
    throw new Error(`WhatsApp OTP failed — Auth error: ${trimmedResponse}`);
  }

  if (lower.includes('no sufficient credits')) {
    throw new Error(`WhatsApp OTP failed — Insufficient BhashSMS credits. Raw: ${trimmedResponse}`);
  }

  if (lower.includes('daily limit')) {
    throw new Error(`WhatsApp OTP failed — Daily sending limit crossed. Raw: ${trimmedResponse}`);
  }

  if (!response.ok) {
    throw new Error(`WhatsApp OTP failed — HTTP ${response.status}: ${trimmedResponse}`);
  }

  console.log(`✅ WhatsApp OTP successfully dispatched to ${formattedPhone}`);
};
