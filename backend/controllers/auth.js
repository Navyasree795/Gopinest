const AuthService = require('../services/AuthService');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const cookie = require('cookie');
const config = require('../config/config');

/**
 * @desc    Send OTP to mobile number
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Mobile number required' });
  }

  const result = await AuthService.initiateLogin(mobile);

  if (!result || !result.success) {
    return res.status(400).json({ 
      success: false, 
      message: result?.error || 'Authentication service error' 
    });
  }

  // In development, we can return the OTP for testing if it's available
  const responseData = { 
    success: true, 
    message: result.message || `OTP sent successfully to ${mobile}` 
  };
  
  if (config.env === 'development' && result.otp) {
    responseData.otp = result.otp;
  }

  return res.status(200).json(responseData);
});

/**
 * @desc    Verify Firebase Token and log in
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { firebaseToken, name } = req.body;

  if (!firebaseToken) {
    return res.status(400).json({ success: false, message: 'Firebase token required' });
  }

  try {
    const user = await AuthService.verifyFirebaseToken(firebaseToken);

    if (name && !user.name) {
      user.name = name;
      await user.save();
    }

    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = crypto.randomBytes(64).toString('hex');

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.setHeader('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: config.jwtRefreshExpireSeconds,
      path: '/api/auth',
      sameSite: 'strict',
    }));

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });

  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Refresh session
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'Session expired' });

  const user = await User.findOne({ refreshTokens: token });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid session' });

  const accessToken = AuthService.generateAccessToken(user);
  const newRefreshToken = crypto.randomBytes(64).toString('hex');

  user.refreshTokens = user.refreshTokens.filter(t => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  res.setHeader('Set-Cookie', cookie.serialize('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    maxAge: config.jwtRefreshExpireSeconds,
    path: '/api/auth',
    sameSite: 'strict',
  }));

  return res.status(200).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      isAdmin: user.role === 'admin'
    }
  });
});

/**
 * @desc    Get user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-refreshTokens -otp');
  return res.status(200).json({
    success: true,
    user: { ...user._doc, isAdmin: user.role === 'admin' }
  });
});

/**
 * @desc    Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, mobile } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (mobile && mobile !== user.mobile) {
    const existing = await User.findOne({ mobile });
    if (existing) return res.status(400).json({ success: false, message: 'Mobile in use' });
    user.mobile = mobile;
  }

  await user.save();
  return res.status(200).json({
    success: true,
    user: { ...user._doc, isAdmin: user.role === 'admin' }
  });
});

/**
 * @desc    Log out
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: token } });
  }

  res.setHeader('Set-Cookie', cookie.serialize('refreshToken', '', {
    httpOnly: true,
    secure: config.env === 'production',
    expires: new Date(0),
    path: '/api/auth',
    sameSite: 'strict',
  }));

  return res.status(200).json({ success: true, message: 'Logged out' });
});

/**
 * @desc    FCM Token registration
 */
const saveFcmToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
  return res.status(200).json({ success: true, message: 'Token saved' });
});

module.exports = {
  sendOtp,
  verifyOtp,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
  saveFcmToken,
};
