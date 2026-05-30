// backend/test/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User'); // Import User model
const Room = require('../models/Room'); // Import Room model

let mongoServer;

global.user = null; // Declare global user
global.room = null; // Declare global room

before(async () => {
  console.log('Setup: Starting MongoMemoryServer...');
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`Setup: MongoMemoryServer started, URI: ${mongoUri}`);

  console.log('Setup: Connecting to Mongoose...');
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, bufferCommands: false });
  console.log('Setup: Mongoose connected.');
  console.log(`Test MongoDB connected to: ${mongoUri}`);

  // Create a global dummy user and room for tests
  global.user = await User.create({
    phone: '1111111111',
    mobile: '1111111111',
    name: 'Global Test User',
    role: 'user'
  });
  console.log(`Setup: Global user created with ID: ${global.user._id}`);

  global.room = await Room.create({
    title: 'Global Test Room',
    city: 'Global City',
    location: 'Global Location',
    rent: 5000,
    deposit: 10000,
    roomType: '1 BHK',
    tenantType: 'Any',
    description: 'A global test room description.',
    ownerId: global.user._id,
    images: ['uploads/global-test-image.jpg'],
    status: 'pending'
  });
  console.log(`Setup: Global room created with ID: ${global.room._id}`);
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Test MongoDB disconnected and server stopped.');
});
