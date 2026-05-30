const Contact = require('../models/Contact');
const Room = require('../models/Room');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Request a call from a room owner
// @route   POST /api/contact/call-request
// @access  Private
const requestCall = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const requester = req.user;

  const room = await Room.findById(roomId).populate('ownerId', 'mobile name');
  if (!room) return ApiResponse.error(res, 'Room not found', 404);

  const owner = room.ownerId;
  
  // Create log
  const contact = await Contact.create({
    requesterId: requester._id,
    ownerId: owner._id,
    roomId: room._id,
    type: 'call_request',
  });

  // Notify Owner (In a real app, this could be a push notification or email)
  console.log(`[CONTACT] Call request for ${owner.mobile} from ${requester.mobile}`);

  return ApiResponse.success(res, 'Call request sent to owner', contact, 201);
});

// @desc    Send a text message / inquiry to owner
// @route   POST /api/contact/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { roomId, message, checkInDate, checkOutDate } = req.body;
  const requester = req.user;

  if (!message) return ApiResponse.error(res, 'Message body is required', 400);

  const room = await Room.findById(roomId).populate('ownerId', 'mobile name');
  if (!room) return ApiResponse.error(res, 'Room not found', 404);

  const contact = await Contact.create({
    requesterId: requester._id,
    ownerId: room.ownerId._id,
    roomId: room._id,
    type: 'message',
    message,
    checkInDate,
    checkOutDate,
  });

  // Optional: Console log for development
  console.log(`[CONTACT] Message for ${room.ownerId.mobile} from ${requester.mobile}`);

  return ApiResponse.success(res, 'Inquiry sent successfully', contact, 201);
});

module.exports = {
  requestCall,
  sendMessage,
};
