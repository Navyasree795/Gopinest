const express = require('express');
const router = express.Router();
const {
  getStats,
  getAdminRooms,
  approveRoom,
  rejectRoom,
  getUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/admin');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// All admin routes are protected and require admin role
router.use(protect, isAdmin);

router.get('/stats', getStats);
router.get('/rooms', getAdminRooms);
router.put('/approve/:id', approveRoom);
router.put('/reject/:id', rejectRoom);

// User Management Routes
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
