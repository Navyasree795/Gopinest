const PaymentService = require('../services/PaymentService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return ApiResponse.error(res, 'Room ID is required', 400);

  const order = await PaymentService.createOrder(roomId);
  return ApiResponse.success(res, 'Order created successfully', order);
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { roomId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!roomId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return ApiResponse.error(res, 'All payment details are required', 400);
  }

  const updatedRoom = await PaymentService.verifyPayment(
    roomId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  return ApiResponse.success(res, 'Payment verified and room published', updatedRoom);
});

// @desc    Handle Razorpay Webhook
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  await PaymentService.handleWebhook(signature, req.rawBody, req.body);
  return res.status(200).send('OK');
});

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};

