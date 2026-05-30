const mongoose = require('mongoose');
const config = require('./config');

/**
 * Standardizes MongoDB connection using 127.0.0.1 for stability
 */
const connectDB = async () => {
  let uri = config.mongoUri;
  
  if (!uri) {
    console.error('\x1b[31m❌ MONGO_URI is not defined in environment variables.\x1b[0m');
    if (config.env === 'development' && process.env.ALLOW_MOCK_DB === 'true') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        console.log('\x1b[33m⚠️ Using Mock MongoDB Server (Missing MONGO_URI Fallback)\x1b[0m');
        return;
      } catch (mockErr) {
        console.error('[DB] Mock failure:', mockErr.message);
      }
    }
    process.exit(1);
  }

  // Force 127.0.0.1 over localhost for local Windows stability
  if (uri.includes('localhost')) {
    uri = uri.replace('localhost', '127.0.0.1');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m✅ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31m❌ MongoDB Connection Error: ${err.message}\x1b[0m`);
    
    if (config.env === 'development' && process.env.ALLOW_MOCK_DB === 'true') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
        console.log('\x1b[33m⚠️ Using Mock MongoDB Server\x1b[0m');
        return;
      } catch (mockErr) {
        console.error('[DB] Mock failure:', mockErr.message);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
