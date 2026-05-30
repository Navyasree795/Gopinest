const express = require('express');
const router = express.Router();
const {
  addRoom,
  getAllRooms,
  searchRooms,
  getRoomById,
  updateRoomStatus,
  deleteRoom,
  getMyRooms,
} = require('../controllers/rooms');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');


// Public routes
router.get('/all', getAllRooms);
router.get('/search', searchRooms);
router.get('/:id', getRoomById);

// Private routes
router.post('/add', protect, upload.array('images', 5), addRoom);
router.get('/my-rooms', protect, getMyRooms); // Added this route
router.put('/:id/status', protect, updateRoomStatus);
router.delete('/:id', protect, deleteRoom);

module.exports = router;
