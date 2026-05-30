const Room = require('../models/Room');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOwners = await User.countDocuments({ role: 'owner' });
  const totalRooms = await Room.countDocuments();
  const pendingRooms = await Room.countDocuments({ status: 'pending' });
  const approvedRooms = await Room.countDocuments({ status: 'approved' });
  const rejectedRooms = await Room.countDocuments({ status: 'rejected' });
  const totalPaidListings = await Room.countDocuments({ paymentStatus: 'success' });
  const totalRevenue = totalPaidListings * 39;

  return ApiResponse.success(res, 'Stats retrieved', {
    users: { total: totalUsers, owners: totalOwners },
    rooms: { total: totalRooms, pending: pendingRooms, approved: approvedRooms, rejected: rejectedRooms },
    revenue: {
      totalPaidListings,
      totalRevenue,
    }
  });
});

// @desc    Get all rooms for admin
// @route   GET /api/admin/rooms
// @access  Private/Admin
const getAdminRooms = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query.status = status;
  }

  const rooms = await Room.find(query)
    .populate('ownerId', 'name mobile')
    .sort({ createdAt: -1 });
    
  return ApiResponse.success(res, 'Admin rooms retrieved', rooms);
});

// @desc    Approve a room
// @route   PUT /api/admin/approve/:id
// @access  Private/Admin
const approveRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', isPublished: true },
    { new: true }
  ).populate('ownerId', 'name mobile');

  if (!room) return ApiResponse.error(res, 'Room not found', 404);

  return ApiResponse.success(res, 'Room approved', room);
});

// @desc    Reject a room
// @route   PUT /api/admin/reject/:id
// @access  Private/Admin
const rejectRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  ).populate('ownerId', 'name mobile');

  if (!room) return ApiResponse.error(res, 'Room not found', 404);

  return ApiResponse.success(res, 'Room rejected', room);
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-otp -refreshTokens -__v').sort({ createdAt: -1 });
  return ApiResponse.success(res, 'Users retrieved', users);
});

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (req.user._id.toString() === id) {
    return ApiResponse.error(res, 'You cannot change your own role.', 403);
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) return ApiResponse.error(res, 'User not found.', 404);

  return ApiResponse.success(res, `User role updated to ${role}.`, user);
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    return ApiResponse.error(res, 'You cannot delete your own account.', 403);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) return ApiResponse.error(res, 'User not found.', 404);

  return ApiResponse.success(res, 'User deleted successfully.');
});

module.exports = {
  getStats,
  getAdminRooms,
  approveRoom,
  rejectRoom,
  getUsers,
  updateUserRole,
  deleteUser,
};
