const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const path = require('path');

const config = require('./config/config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { setupSecurity } = require('./middleware/security');

/**
 * SmartStay Hub - Final Stability Orchestrator
 */
const startServer = async () => {
  console.log('\x1b[35m[STARTUP] Initializing SmartStay Hub Server...\x1b[0m');
  
  // Non-blocking DB connection for Dev resilience
  connectDB();

  const app = express();
  const server = http.createServer(app);

  // 1. ABSOLUTE PRIORITY MIDDLEWARES
  app.use(express.json({ 
    limit: '5mb',
    verify: (req, res, buf) => {
      if (req.originalUrl === '/api/payment/webhook') {
        req.rawBody = buf.toString();
      }
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());
  
  // 2. SECURITY & CORS (Dynamically loaded from config)
  const allowedOrigins = config.allowedOrigins;
  
  setupSecurity(app);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || config.env === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
  }));

  // 3. LOGGING
  if (config.env === 'development') {
    app.use(morgan('dev'));
    app.use((req, res, next) => {
      console.log(`\x1b[35m[REQ] ${req.method} ${req.url}\x1b[0m`);
      next();
    });
  }

  // 4. API ROUTES
  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'operational' });
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/rooms', require('./routes/rooms'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/contact', require('./routes/contact'));
  app.use('/api/payment', require('./routes/payment'));

  // Serve static files from uploads directory
  app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

  // 5. 404 Catcher
  app.use((req, res) => {
    console.log(`\x1b[33m[404] Route not found: ${req.url}\x1b[0m`);
    res.status(404).json({ success: false, message: 'API Route Not Found' });
  });

  // 6. GLOBAL ERROR HANDLER
  app.use(errorHandler);

  const PORT = config.port || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ===========================================
    🚀 SERVER IS LIVE ON PORT ${PORT}
    📡 ADDRESS: http://127.0.0.1:${PORT}
    🛠️  MODE: ${config.env}
    ===========================================
    `);
  });
};

startServer().catch(err => {
  console.error('\x1b[31m[FATAL] Startup failed:\x1b[0m', err.message);
});
