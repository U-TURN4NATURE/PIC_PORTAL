const axios = require('axios');

async function testNewSMS() {
  const authkey = '49738AirJSyn6uPr52a59925';
  const mobiles = '917983299389'; // User's test number
  const otp = '987654';
  const message = `Your login OTP is ${otp} for U-Turn4Nature. thank you. Please do not share with anyone. BPRINT`;
  const sender = 'bPRlNT';
  const route = '4';
  const country = '91';
  const DLT_TE_ID = '1307171973398165343';

  const url = `https://login.wishbysms.com/api/sendhttp.php?authkey=${authkey}&mobiles=${mobiles}&message=${encodeURIComponent(message)}&sender=${sender}&route=${route}&country=${country}&DLT_TE_ID=${DLT_TE_ID}`;

  console.log('Sending request to:', url);

  try {
    const response = await axios.get(url);
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

testNewSMS();
