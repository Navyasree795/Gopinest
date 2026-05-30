const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;

try {
  const saValue = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (saValue) {
    if (saValue.startsWith('{')) {
      // It's a JSON string
      serviceAccount = JSON.parse(saValue);
    } else {
      // It's a file path
      const saPath = path.isAbsolute(saValue) 
        ? saValue 
        : path.join(__dirname, '..', saValue);
      
      if (fs.existsSync(saPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      } else {
        // Try direct require as fallback
        serviceAccount = require('./serviceAccountKey.json');
      }
    }
  } else {
    // Default fallback to local file
    const localSaPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(localSaPath)) {
      serviceAccount = require('./serviceAccountKey.json');
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('\x1b[32m[FIREBASE] Admin SDK initialized successfully\x1b[0m');
  } else {
    console.warn('\x1b[33m[FIREBASE] Warning: Service account not found. Firebase features will be limited.\x1b[0m');
  }
} catch (error) {
  console.error('\x1b[31m[FIREBASE] Initialization Error:\x1b[0m', error.message);
}

module.exports = admin;
