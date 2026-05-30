const express = require('express');
const router = express.Router();
const { requestCall, sendMessage } = require('../controllers/contact');
const { protect } = require('../middleware/auth');

// All contact routes are protected
router.use(protect);

router.post('/call-request', requestCall);
router.post('/message', sendMessage);

module.exports = router;
