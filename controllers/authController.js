const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmailOtp = require('../utils/sendEmailOtp');
const { sendOtp, verifyOtp } = require('../utils/sendSmsOtp');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.registerWithEmail = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60000);

    user = new User({ name, email, password: hashedPassword, emailOtp: otp, emailOtpExpires: otpExpires });
    await user.save();

    await sendEmailOtp(email, otp);

    res.json({ message: 'OTP sent to email, verify to complete registration' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.emailOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.emailOtpExpires < new Date()) return res.status(400).json({ message: 'OTP expired' });

    user.emailOtp = null;
    user.emailOtpExpires = null;
    await user.save();

    res.json({ message: 'Email verified, you can now log in' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMobileOtp = async (req, res) => {
  try {
    const { phone, method } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const validMethods = ['SMS', 'CALL'];
    const methodToUse = validMethods.includes(method) ? method : 'SMS';

    let user = await User.findOne({ phone });
    if (!user) user = new User({ phone });

    const result = await sendOtp(phone, methodToUse);

    user.otpSessionId = result.Details;
    await user.save();

    res.json({ message: `OTP sent via ${methodToUse}`, sessionId: result.Details });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyMobileOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || !user.otpSessionId) return res.status(400).json({ message: 'Invalid session' });

    const result = await verifyOtp(user.otpSessionId, otp);
    if (result.Details !== 'OTP Matched') return res.status(400).json({ message: 'OTP mismatch' });

    user.otpSessionId = null;
    await user.save();

    res.json({ message: 'Mobile verified, you can now log in' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW Secure Login: email + password OR phone + OTP verification, returns JWT token
exports.login = async (req, res) => {
  try {
    const { email, phone, password, otp } = req.body;
    let user;

    if (email && password) {
      user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });

      if (user.emailOtp || (user.emailOtpExpires && user.emailOtpExpires > new Date())) {
        return res.status(403).json({ message: 'Email not verified. Please verify OTP first.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: 'Invalid password' });
    } 
    else if (phone && otp) {
      user = await User.findOne({ phone });
      if (!user || !user.otpSessionId) return res.status(400).json({ message: 'Invalid or expired session' });

      const result = await verifyOtp(user.otpSessionId, otp);
      if (result.Details !== 'OTP Matched') return res.status(401).json({ message: 'Invalid OTP' });

      user.otpSessionId = null;
    } 
    else {
      return res.status(400).json({ message: 'Provide email/password or phone/otp to login' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Refresh token invalid or expired' });
  }
};

//logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.refreshToken = null;
    user.refreshTokenExpires = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// controllers/authController.js

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




