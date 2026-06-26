// ─────────────────────────────────────────────────
// WhatsApp Service — Powered by Bhash SMS
// Template: pic_portal_otp (AUTHENTICATION type)
// API: stype=auth with OTP as Params
// ─────────────────────────────────────────────────

const BHASH_BASE_URL = 'http://bhashsms.com/api/sendmsg.php';
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
 * Uses stype=auth and the approved template pic_portal_otp
 *
 * Template text: "{{1}} is your verification code for PIC Portal. For your security, do not share this code."
 * Bhash replaces {{1}} with the OTP passed as Params
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
    stype: 'normal',
    Params: otp,
  });

  const url = `${BHASH_BASE_URL}?${params.toString()}`;

  console.log(`📱 Sending WhatsApp OTP to: ${formattedPhone}`);

  const response = await fetch(url);
  const responseText = await response.text();

  console.log(`📨 Bhash API response for ${formattedPhone}:`, responseText);

  // Bhash returns error responses as plain text starting with 'error'
  if (responseText.toLowerCase().startsWith('error') || !response.ok) {
    throw new Error(`WhatsApp OTP failed: ${responseText}`);
  }
};
