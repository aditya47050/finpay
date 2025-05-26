const axios = require('axios');

const sendOtp = async (phone, method = 'SMS') => {
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  const url = `https://2factor.in/API/V1/${apiKey}/${method}/+91${phone}/AUTOGEN`;

  const response = await axios.get(url);
  return response.data;
};

module.exports = { sendOtp };

const verifyOtp = async (sessionId, otp) => {
  const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
  const response = await axios.get(url);
  return response.data;
};

module.exports = { sendOtp, verifyOtp };
