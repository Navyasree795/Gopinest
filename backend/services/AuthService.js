const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const admin = require('../config/firebaseAdmin');

class AuthService {
  /**
   * Generates a signed JWT access token.
   */
  static generateAccessToken(user) {
    try {
      if (!user || !user._id) return null;
      return jwt.sign(
        { id: user._id.toString(), role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtAccessExpire }
      );
    } catch (e) {
      console.error('[AUTH SVC] Token error:', e.message);
      return null;
    }
  }

  /**
   * Verifies Firebase ID Token and returns/creates user.
   */
  static async verifyFirebaseToken(token) {
    try {
      let mobile;

      // DEVELOPMENT MOCK TOKEN BYPASS
      if (token && token.startsWith('MOCK_TOKEN_')) {
        console.log(`[AUTH SVC] Demo Mock Token detected: ${token}`);
        const mockMobile = token.replace('MOCK_TOKEN_', '');
        mobile = mockMobile.length === 10 ? `+91${mockMobile}` : `+${mockMobile}`;
      } else {
        console.log('[AUTH SVC] Verifying real Firebase token...');
        // 1. Verify token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        mobile = decodedToken.phone_number;
      }

      console.log(`[AUTH SVC] Resolved Mobile: ${mobile}`);

      if (!mobile) {
        throw new Error('Phone number not found in token');
      }

      // 2. Format phone number
      let formattedMobile = mobile;
      if (mobile.startsWith('+91')) {
        formattedMobile = mobile.substring(3);
      } else if (mobile.startsWith('+')) {
        formattedMobile = mobile.substring(1);
      }
      formattedMobile = formattedMobile.replace(/\D/g, '');
      
      console.log(`[AUTH SVC] Formatted Mobile: ${formattedMobile}`);

      // 3. Find or Create User
      console.log('[AUTH SVC] Querying MongoDB for user...');
      let user = await User.findOne({ mobile: formattedMobile });
      
      const adminMobile = process.env.ADMIN_MOBILE || '8688946165';
      
      if (!user) {
        console.log('[AUTH SVC] User not found. Creating new user...');
        user = new User({ 
          mobile: formattedMobile,
          role: formattedMobile === adminMobile ? 'admin' : 'user'
        });
      } else {
        console.log(`[AUTH SVC] User found: ${user._id}`);
        if (formattedMobile === adminMobile && user.role !== 'admin') {
          user.role = 'admin';
        }
      }

      // 4. Update login timestamp
      user.lastLogin = new Date();
      await user.save();
      console.log('[AUTH SVC] User saved successfully');

      return user;
    } catch (error) {
      console.error('[AUTH SVC] Firebase verification failed:', error.message);
      throw new Error('Invalid or expired Firebase token');
    }
  }

  /**
   * Handles OTP generation (REMOVED - handled by Firebase on frontend)
   */
  static async initiateLogin(mobile) {
    console.log(`[AUTH SVC] initiateLogin -> ${mobile} (Firebase handled)`);
    return { success: true, message: 'Firebase will handle OTP delivery' };
  }
}

module.exports = AuthService;
