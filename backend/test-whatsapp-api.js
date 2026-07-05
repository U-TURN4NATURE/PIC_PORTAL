/**
 * ─────────────────────────────────────────────────────────────────
 * BhashSMS WhatsApp API — Diagnostic Test Script
 * Run: node backend/test-whatsapp-api.js
 * ─────────────────────────────────────────────────────────────────
 *
 * Tests all 3 scenarios:
 *   1. Correct endpoint + stype=auth  (the one we use for OTP)
 *   2. Correct endpoint + stype=normal (alternate)
 *   3. Old wrong endpoint (sendmsg.php) — to confirm it's wrong
 *
 * Usage:
 *   node test-whatsapp-api.js [phone]
 *   node test-whatsapp-api.js 9876543210   # will actually attempt to send!
 * ─────────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: '.env' });
const http = require('http');

const CONFIG = {
  user: process.env.BHASH_USER || 'abku73',
  pass: process.env.BHASH_PASS || '123456',
  sender: process.env.BHASH_SENDER || 'BUZWAP',
  template: process.env.BHASH_WA_OTP_TEMPLATE || 'pic_portal_otp',
  // Use admin phone from env for test, or pass as CLI arg
  phone: process.argv[2] || (process.env.ADMIN_SEED_PHONE || '7983299389'),
  testOtp: '482913', // Static OTP for testing
};

const CORRECT_ENDPOINT = 'http://bhashsms.com/api/sendmsgutil.php';
const OLD_ENDPOINT = 'http://bhashsms.com/api/sendmsg.php';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () =>
        resolve({ status: res.statusCode, body: data.trim() })
      );
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

function classifyResponse(body) {
  const lower = body.toLowerCase();
  if (lower.includes('only utility or authentication') || lower.includes('splitcredits not activated')) {
    return '❌ TEMPLATE NOT APPROVED — Template must be approved as Authentication/Utility on BhashSMS panel, or SplitCredits not activated';
  }
  if (lower.includes('no sufficient credits')) {
    return '❌ NO CREDITS — Top up your BhashSMS account';
  }
  if (lower.startsWith('error') || lower.includes('invalid user')) {
    return '❌ AUTH FAILED — Wrong username/password';
  }
  if (lower.includes('daily limit')) {
    return '❌ DAILY LIMIT — Sending limit reached for today';
  }
  if (lower === 'sent' || /^\d+$/.test(lower)) {
    return '✅ SUCCESS — Message sent!';
  }
  return `⚠️  UNKNOWN RESPONSE — Manual review needed`;
}

async function runTests() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  BhashSMS WhatsApp API — Diagnostic Test');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  User:     ${CONFIG.user}`);
  console.log(`  Sender:   ${CONFIG.sender}`);
  console.log(`  Template: ${CONFIG.template}`);
  console.log(`  Phone:    ${CONFIG.phone}`);
  console.log(`  Test OTP: ${CONFIG.testOtp}`);
  console.log('════════════════════════════════════════════════════════════\n');

  const tests = [
    {
      name: 'Test 1 — Correct endpoint + stype=auth (PRODUCTION USE)',
      url: CORRECT_ENDPOINT,
      params: {
        user: CONFIG.user, pass: CONFIG.pass, sender: CONFIG.sender,
        phone: CONFIG.phone, text: CONFIG.template,
        priority: 'wa', stype: 'auth', Params: CONFIG.testOtp
      },
    },
    {
      name: 'Test 2 — Correct endpoint + stype=normal',
      url: CORRECT_ENDPOINT,
      params: {
        user: CONFIG.user, pass: CONFIG.pass, sender: CONFIG.sender,
        phone: CONFIG.phone, text: CONFIG.template,
        priority: 'wa', stype: 'normal', Params: CONFIG.testOtp
      },
    },
    {
      name: 'Test 3 — OLD wrong endpoint (sendmsg.php) — should NOT work',
      url: OLD_ENDPOINT,
      params: {
        user: CONFIG.user, pass: CONFIG.pass, sender: CONFIG.sender,
        phone: CONFIG.phone, text: CONFIG.template,
        priority: 'wa', stype: 'auth', Params: CONFIG.testOtp
      },
    },
    {
      name: 'Test 4 — Credentials check (wrong password)',
      url: CORRECT_ENDPOINT,
      params: {
        user: CONFIG.user, pass: 'WRONG_PASSWORD_TEST', sender: CONFIG.sender,
        phone: CONFIG.phone, text: CONFIG.template,
        priority: 'wa', stype: 'auth', Params: CONFIG.testOtp
      },
    },
  ];

  for (const test of tests) {
    console.log(`\n──────────────────────────────────────────────`);
    console.log(`📋 ${test.name}`);
    const qs = new URLSearchParams(test.params).toString();
    const fullUrl = `${test.url}?${qs}`;
    console.log(`🔗 URL: ${fullUrl}\n`);

    try {
      const result = await makeRequest(fullUrl);
      const classification = classifyResponse(result.body);
      console.log(`   HTTP Status : ${result.status}`);
      console.log(`   Raw Response: "${result.body}"`);
      console.log(`   Classification: ${classification}`);
    } catch (err) {
      console.log(`   ❌ Request Error: ${err.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  WHAT TO DO IF TEMPLATE NOT APPROVED:');
  console.log('  1. Log in to bhashsms.com panel');
  console.log('  2. Go to WhatsApp Templates section');
  console.log('  3. Ensure "pic_portal_otp" is created & approved');
  console.log('     Category: Authentication');
  console.log(`     Body: "{{1}} is your verification code for PIC Portal.`);
  console.log('            For your security, do not share this code."');
  console.log('  4. If SplitCredits error: contact BhashSMS support to activate');
  console.log('════════════════════════════════════════════════════════════\n');
}

runTests().catch(console.error);
