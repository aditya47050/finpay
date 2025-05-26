const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  emailOtp: { type: String },
  emailOtpExpires: { type: Date },
  otpSessionId: { type: String },
  refreshToken: { type: String },
  refreshTokenExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
