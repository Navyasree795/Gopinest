const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Validates environment variables.
 * In production, missing variables will cause the process to exit.
 * In development, missing variables will only show warnings.
 */
const validateEnv = () => {
  const critical = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_ACCESS_EXPIRE',
    'JWT_REFRESH_EXPIRE_SECONDS'
  ];

  const integration = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];

  const missingCritical = critical.filter((key) => !process.env[key]);
  const missingIntegration = integration.filter((key) => !process.env[key]);

  if (missingCritical.length > 0) {
    console.error(`\x1b[31m[CRITICAL CONFIG ERROR] Missing essential variables: ${missingCritical.join(', ')}\x1b[0m`);
    if (isProduction) {
      console.error('Server cannot start without essential configuration in production.');
      process.exit(1);
    }
  }

  if (missingIntegration.length > 0) {
    console.warn(`\x1b[33m[CONFIG WARNING] Missing integration variables: ${missingIntegration.join(', ')}\x1b[0m`);
    console.warn('Some features (Cloudinary, Razorpay) may not work correctly.');
    if (isProduction) {
      console.error('Production requires all integration variables to be set.');
      process.exit(1);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    const msg = '[SECURITY WARNING] JWT_SECRET is too short. Use at least 32 characters.';
    if (isProduction) {
      console.error(`\x1b[31m${msg} (Production requirement)\x1b[0m`);
      process.exit(1);
    } else {
      console.warn(`\x1b[33m${msg}\x1b[0m`);
    }
  }
};

validateEnv();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
  jwtRefreshExpireSeconds: parseInt(process.env.JWT_REFRESH_EXPIRE_SECONDS, 10) || 604800,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'],
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    isConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    isConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT
  },
  appHash: process.env.APP_HASH || ''
};
