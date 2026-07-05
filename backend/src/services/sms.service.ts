import axios from 'axios';

export const sendSMSOTP = async (mobile: string, otp: string) => {
  const authkey = process.env.WISHBYSMS_AUTH_KEY || '49738AirJSyn6uPr52a59925';
  const sender = process.env.WISHBYSMS_SENDER || 'bPRlNT';
  const route = '4';
  const country = '91';
  const DLT_TE_ID = process.env.WISHBYSMS_DLT_TE_ID || '1307171973398165343';

  // Format message as requested: "Your login OTP is (var) for U-Turn4Nature. thank you. Please do not share with anyone. BPRINT"
  const message = `Your login OTP is ${otp} for U-Turn4Nature. thank you. Please do not share with anyone. BPRINT`;

  const url = `https://login.wishbysms.com/api/sendhttp.php?authkey=${authkey}&mobiles=${mobile}&message=${encodeURIComponent(
    message
  )}&sender=${sender}&route=${route}&country=${country}&DLT_TE_ID=${DLT_TE_ID}`;

  try {
    const response = await axios.get(url);
    console.log(`✅ SMS OTP sent to ${mobile}, Response: ${response.data}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to send SMS OTP:', error.message);
    throw new Error('Failed to send SMS');
  }
};
