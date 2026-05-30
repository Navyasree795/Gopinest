const Room = require('../models/Room');
const { deleteImage, getPublicIdFromUrl } = require('../utils/cloudinary');
const mongoose = require('mongoose');

class RoomService {
  /**
   * Add a new room
   */
  static async createRoom(roomData) {
    // Ensure all numeric fields are Numbers
    const cleanedData = {
      ...roomData,
      rent: Number(roomData.rent),
      deposit: Number(roomData.deposit),
    };
    return await Room.create(cleanedData);
  }

  /**
   * Get rooms with filters and pagination
   */
  static async getRooms(filters, options = {}) {
    const { page = 1, limit = 12 } = options;
    const skip = (Number(page) - 1) * Number(limit);

    // Public view should always be approved
    const query = { 
      status: { $in: ['approved', 'Approved'] }, // Case-insensitive status safety
      ...filters 
    };

    const rooms = await Room.find(query)
      .populate('ownerId', 'name mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Room.countDocuments(query);

    return {
      rooms,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      },
    };
  }

  /**
   * Verify payment and publish room
   */
  static async publishRoom(roomId, paymentId, orderId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new Error('Invalid Room ID format');
    }

    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    room.paymentStatus = 'success';
    room.paymentId = paymentId;
    room.orderId = orderId;
    room.isPublished = true;
    room.status = 'approved'; // Auto-publish on payment
    room.publishedAt = Date.now();

    return await room.save();
  }

  /**
   * Delete room and cleanup images
   */
  static async deleteRoom(roomId) {
    const room = await Room.findById(roomId);
    if (!room) return null;

    // Async cleanup of images from Cloudinary
    if (room.images && room.images.length > 0) {
      room.images.forEach(async (imgUrl) => {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (publicId) {
          await deleteImage(publicId).catch(err => console.error(`[SVC] Image cleanup failed for ${publicId}:`, err.message));
        }
      });
    }

    return await room.deleteOne();
  }
}

module.exports = RoomService;
