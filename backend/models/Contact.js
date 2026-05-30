const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  type: {
    type: String,
    enum: ['call-request', 'message'],
    required: true,
  },
  message: {
    type: String,
    trim: true,
  },
  checkInDate: { // Added for booking inquiry
    type: Date,
    required: false,
  },
  checkOutDate: { // Added for booking inquiry
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contact', ContactSchema);
