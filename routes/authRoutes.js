const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register-email', authController.registerWithEmail);
router.post('/verify-email-otp', authController.verifyEmailOtp);

router.post('/send-mobile-otp', authController.sendMobileOtp);
router.post('/verify-mobile-otp', authController.verifyMobileOtp);

router.post('/login', authController.login);
router.post('/change-password', authMiddleware, authController.changePassword);

router.post('/refresh-token', authController.refreshAccessToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
