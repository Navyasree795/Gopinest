const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{10,15}$/, 'Please fill a valid mobile number'],
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  refreshTokens: [String],
  fcmToken: {
    type: String,
  },
});

// Prevention of OverwriteModelError in Dev environments
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
