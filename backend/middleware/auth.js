const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const config = require('../config/config');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return ApiResponse.error(res, 'Not authorized, user not found', 401);
      }

      next();
    } catch (error) {
      console.error(error);
      return ApiResponse.error(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, no token', 401);
  }
};

module.exports = { protect };
