const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailOtp = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for GPay Backend',
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmailOtp;
