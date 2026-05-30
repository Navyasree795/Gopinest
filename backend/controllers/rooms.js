const RoomService = require('../services/RoomService');
const Room = require('../models/Room');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// @desc    Add a new room
// @route   POST /api/rooms/add
// @access  Private
const addRoom = asyncHandler(async (req, res) => {
  const { title, city, location, rent, deposit, roomType, tenantType, amenities, description } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return ApiResponse.error(res, 'Please upload at least one image.', 400);
  }

  const images = req.files.map(file => file.path);

  let amenitiesArray = [];
  if (amenities) {
    amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
  }

  const room = await RoomService.createRoom({
    ownerId: req.user._id,
    title,
    city,
    location,
    rent: Number(rent),
    deposit: Number(deposit),
    roomType,
    tenantType,
    amenities: amenitiesArray,
    description,
    images,
  });

  // Auto-upgrade user to owner
  if (req.user.role === 'user') {
    await User.findByIdAndUpdate(req.user._id, { role: 'owner' });
  }

  return ApiResponse.success(res, 'Room listed as draft. Complete payment to publish.', room, 201);
});

// @desc    Get all approved rooms
// @route   GET /api/rooms/all
// @access  Public
const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ status: 'approved' })
    .populate('ownerId', 'name mobile')
    .sort({ createdAt: -1 });
    
  return ApiResponse.success(res, 'All rooms retrieved', rooms);
});

// @desc    Search for approved rooms with filters and pagination
// @route   GET /api/rooms/search
// @access  Public
const searchRooms = asyncHandler(async (req, res) => {
  const { city, location, roomType, tenantType, minRent, maxRent, page, limit } = req.query;
  
  const filters = {};
  if (city) filters.city = { $regex: city, $options: 'i' };
  if (location) filters.location = { $regex: location, $options: 'i' };
  if (roomType) filters.roomType = roomType;
  if (tenantType) filters.tenantType = tenantType;
  
  if (minRent || maxRent) {
    filters.rent = {};
    if (minRent) filters.rent.$gte = Number(minRent);
    if (maxRent) filters.rent.$lte = Number(maxRent);
  }

  const result = await RoomService.getRooms(filters, { 
    page: Number(page) || 1, 
    limit: Number(limit) || 12 
  });

  return ApiResponse.success(res, 'Search results', result);
});

// @desc    Get a single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('ownerId', 'name mobile');
  
  if (!room) {
    return ApiResponse.error(res, 'Room not found', 404);
  }

  return ApiResponse.success(res, 'Room retrieved', room);
});

// @desc    Update room status (Approve/Reject by Admin)
// @route   PUT /api/rooms/:id/status
// @access  Private/Admin
const updateRoomStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const room = await Room.findById(req.params.id);

  if (!room) {
    return ApiResponse.error(res, 'Room not found', 404);
  }

  room.status = status;
  await room.save();

  return ApiResponse.success(res, `Room status updated to ${status}`, room);
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Owner
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  
  if (!room) {
    return ApiResponse.error(res, 'Room not found', 404);
  }

  // Check ownership
  if (room.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to delete this room', 403);
  }

  await RoomService.deleteRoom(req.params.id);
  return ApiResponse.success(res, 'Room deleted successfully');
});

// @desc    Get my rooms
// @route   GET /api/rooms/my-rooms
// @access  Private
const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  return ApiResponse.success(res, 'My rooms retrieved', rooms);
});

module.exports = {
  addRoom,
  getAllRooms,
  searchRooms,
  getRoomById,
  updateRoomStatus,
  deleteRoom,
  getMyRooms,
};
