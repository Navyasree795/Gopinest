const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  rent: {
    type: Number,
    required: [true, 'Rent amount is required'],
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit amount is required'],
  },
  roomType: {
    type: String,
    enum: ['single room', 'shared room', '1 bhk', '2 bhk', 'studio', 'pg'],
    required: [true, 'Room type is required'],
  },
  tenantType: {
    type: String,
    enum: ['student', 'working professional', 'family', 'any'],
    required: [true, 'Tenant type is required'],
  },
  amenities: [
    {
      type: String,
      trim: true,
    },
  ],
  images: [
    {
      type: String,
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  availableFrom: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  paymentId: String,
  orderId: String,
  isPublished: {
    type: Boolean,
    default: false,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
RoomSchema.index({ city: 1 });
RoomSchema.index({ rent: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ roomType: 1 });
RoomSchema.index({ tenantType: 1 });
RoomSchema.index({ isPublished: 1 });
RoomSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Room', RoomSchema);
