// backend/test/models/room.test.js
const { expect } = require('chai');
const mongoose = require('mongoose');
const Room = require('../../models/Room');
const User = require('../../models/User'); // Assuming User model might be needed for ownerId validation

// The setup.js will handle connecting to MongoMemoryServer and clearing collections

describe('Room Model', () => {
  let user;

  before(async () => { // Changed from beforeEach to before
    console.log('room.test.js: Before hook started. Creating dummy user...');
    await mongoose.connection.asPromise(); // Explicitly wait for connection
    console.log('room.test.js: Mongoose connection is ready.');
    // Create a dummy user for ownerId reference
    user = await User.create({
      phone: '1234567890',
      mobile: '1234567890',
      name: 'Test User',
    });
    console.log('room.test.js: Dummy user created:', user._id);
  });

  it('should create a new room successfully with valid data', async () => {
    const roomData = {
      title: 'Test Room Title',
      city: 'Mumbai',
      location: 'Andheri',
      rent: 10000,
      deposit: 20000,
      roomType: '1 BHK',
      tenantType: 'Working Professional',
      description: 'A spacious and well-lit room for testing purposes.',
      amenities: ['WiFi', 'AC'],
      ownerId: user._id,
      images: ['uploads/test-image1.jpg'],
    };
    const room = new Room(roomData);
    const savedRoom = await room.save();

    expect(savedRoom._id).to.exist;
    expect(savedRoom.title).to.equal(roomData.title);
    expect(savedRoom.city).to.equal(roomData.city);
    expect(savedRoom.status).to.equal('pending'); // Default status
  });

  it('should not save a room without required fields', async () => {
    const room = new Room({}); // Empty room
    let error;
    try {
      await room.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors.title).to.exist;
    expect(error.errors.city).to.exist;
    expect(error.errors.location).to.exist;
    expect(error.errors.rent).to.exist;
    expect(error.errors.deposit).to.exist;
    expect(error.errors.roomType).to.exist;
    expect(error.errors.tenantType).to.exist;
    expect(error.errors.ownerId).to.exist;
  });

  it('should enforce rent to be a positive number', async () => {
    const room = new Room({
      title: 'Valid Room',
      city: 'Mumbai',
      location: 'Andheri',
      rent: -100, // Invalid rent
      deposit: 20000,
      roomType: '1 BHK',
      tenantType: 'Working Professional',
      description: 'A spacious and well-lit room for testing purposes.',
      ownerId: user._id,
    });
    let error;
    try {
      await room.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors.rent).to.exist;
    expect(error.errors.rent.message).to.include('Path `rent` (-100) is less than minimum allowed value (0).');
  });

  it('should enforce deposit to be a non-negative number', async () => {
    const room = new Room({
      title: 'Valid Room',
      city: 'Mumbai',
      location: 'Andheri',
      rent: 10000,
      deposit: -100, // Invalid deposit
      roomType: '1 BHK',
      tenantType: 'Working Professional',
      description: 'A spacious and well-lit room for testing purposes.',
      ownerId: user._id,
    });
    let error;
    try {
      await room.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors.deposit).to.exist;
    expect(error.errors.deposit.message).to.include('Path `deposit` (-100) is less than minimum allowed value (0).');
  });

  it('should enforce roomType to be from enum values', async () => {
    const room = new Room({
      title: 'Valid Room',
      city: 'Mumbai',
      location: 'Andheri',
      rent: 10000,
      deposit: 20000,
      roomType: 'Invalid Type', // Invalid roomType
      tenantType: 'Working Professional',
      description: 'A spacious and well-lit room for testing purposes.',
      ownerId: user._id,
    });
    let error;
    try {
      await room.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors.roomType).to.exist;
    expect(error.errors.roomType.message).to.include('is not a valid enum value for path `roomType`.');
  });

  it('should enforce tenantType to be from enum values', async () => {
    const room = new Room({
      title: 'Valid Room',
      city: 'Mumbai',
      location: 'Andheri',
      rent: 10000,
      deposit: 20000,
      roomType: '1 BHK',
      tenantType: 'Invalid Tenant', // Invalid tenantType
      description: 'A spacious and well-lit room for testing purposes.',
      ownerId: user._id,
    });
    let error;
    try {
      await room.save();
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.errors.tenantType).to.exist;
    expect(error.errors.tenantType.message).to.include('is not a valid enum value for path `tenantType`.');
  });

  it('should set default status to pending', async () => {
    const roomData = {
      title: 'Test Room',
      city: 'Delhi',
      location: 'Saket',
      rent: 12000,
      deposit: 24000,
      roomType: 'PG',
      tenantType: 'Student',
      description: 'A test PG room.',
      ownerId: user._id,
    };
    const room = new Room(roomData);
    const savedRoom = await room.save();
    expect(savedRoom.status).to.equal('pending');
  });

  it('should set default createdAt to current date', async () => {
    const roomData = {
      title: 'Test Room',
      city: 'Delhi',
      location: 'Saket',
      rent: 12000,
      deposit: 24000,
      roomType: 'PG',
      tenantType: 'Student',
      description: 'A test PG room.',
      ownerId: user._id,
    };
    const room = new Room(roomData);
    const savedRoom = await room.save();
    expect(savedRoom.createdAt).to.exist;
    expect(savedRoom.createdAt).to.be.below(new Date());
  });
});
