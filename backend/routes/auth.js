const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getProfile, updateProfile, refreshToken, logout, saveFcmToken } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/save-fcm-token', protect, saveFcmToken);

module.exports = router;
