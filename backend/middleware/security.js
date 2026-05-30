const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * General Security Middleware Configuration
 */
const setupSecurity = (app) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Helmet first
  app.use(helmet({
    crossOriginResourcePolicy: { policy: isProduction ? "same-origin" : "cross-origin" },
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://api.mapbox.com"],
        connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com"],
        frameSrc: ["'self'", "https://api.razorpay.com"],
      },
    } : false,
  }));
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  setupSecurity,
  authLimiter,
  apiLimiter
};
