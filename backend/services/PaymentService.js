const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const RoomService = require('./RoomService');

// Initialize Razorpay lazily and only if configured
let razorpay = null;
if (config.razorpay.isConfigured) {
  try {
    console.log('[PAYMENT] Initializing Razorpay with provided keys...');
    razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
    console.log('[PAYMENT] Razorpay initialized successfully.');
  } catch (err) {
    console.error('[PAYMENT] Razorpay Initialization Failed:', err.message);
  }
} else {
  console.warn('[PAYMENT WARNING] Razorpay keys missing. Payment features will be limited.');
}

class PaymentService {
  /**
   * Create Razorpay Order
   */
  static async createOrder(roomId) {
    console.log(`[PAYMENT] Create order request received for Room ID: ${roomId}`);

    const room = await Room.findById(roomId);
    if (!room) {
      console.error(`[PAYMENT ERROR] Room not found: ${roomId}`);
      throw new Error('Listing not found');
    }

    if (room.isPublished) {
      console.warn(`[PAYMENT] Room ${roomId} is already published.`);
      throw new Error('Listing is already published');
    }

    const isDev = config.env === 'development';
    
    // In Production, MOCK payment is STRICTLY forbidden
    if (!isDev && (!config.razorpay.isConfigured || !razorpay)) {
      console.error('[PAYMENT FATAL] Attempted to initiate payment in production without valid Razorpay configuration.');
      const error = new Error('Payment gateway error. Please try again later.');
      error.statusCode = 500;
      throw error;
    }

    // Development Mock Logic (Only if not in production)
    if (isDev && (!config.razorpay.isConfigured || !razorpay)) {
        console.log('[PAYMENT] Running in DEVELOPMENT mode with MOCK payment.');
        const mockOrderId = `mock_order_${Math.random().toString(36).substring(7)}`;
        
        // Update room with mock order ID
        room.orderId = mockOrderId;
        room.paymentStatus = 'pending';
        await room.save();

        // Record payment in Payment model
        await Payment.create({
          roomId: room._id,
          userId: room.ownerId,
          razorpayOrderId: mockOrderId,
          amount: 3900,
          status: 'created',
          receipt: `mock_receipt_${Date.now()}`
        });

        return {
          id: mockOrderId,
          amount: 3900,
          currency: 'INR',
          mock: true,
          message: 'Development Mock Order created'
        };
    }

    const options = {
      amount: 39 * 100, // ₹39 in paise
      currency: 'INR',
      receipt: `listing_${roomId.toString().slice(-10)}_${Date.now().toString().slice(-8)}`,
      notes: {
        roomId: roomId.toString(),
        userId: room.ownerId.toString()
      }
    };

    try {
      console.log('[PAYMENT] Creating Razorpay order...');
      const order = await razorpay.orders.create(options);
      console.log(`[PAYMENT] Order created successfully: ${order.id}`);
      
      // Update room with order ID
      room.orderId = order.id;
      room.paymentStatus = 'pending';
      await room.save();

      // Record payment attempt
      await Payment.create({
        roomId: room._id,
        userId: room.ownerId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: 'created',
        receipt: order.receipt
      });

      return order;
    } catch (err) {
      console.error('[PAYMENT ERROR] Razorpay Order Creation Error:', err.message);
      const error = new Error(`Failed to initiate payment: ${err.message}`);
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static async verifyPayment(roomId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    console.log(`[PAYMENT] Verifying payment for Room: ${roomId}, Order: ${razorpayOrderId}`);

    const isDev = config.env === 'development';

    // Development Mock Verification Logic
    if (razorpayOrderId.startsWith('mock_order_') && isDev) {
      console.log('[PAYMENT] Verifying MOCK payment for development.');
      
      // Update Payment Record
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { razorpayPaymentId, razorpaySignature, status: 'captured' }
      );

      return await RoomService.publishRoom(roomId, `mock_pay_${Date.now()}`, razorpayOrderId);
    }

    if (!config.razorpay.isConfigured) {
      console.error('[PAYMENT ERROR] Verification failed: Razorpay keys missing.');
      throw new Error('Payment gateway not configured.');
    }

    const secret = config.razorpay.keySecret;
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpaySignature;

    if (!isSignatureValid) {
      console.error(`[PAYMENT ERROR] Security Alert: Invalid signature for Room ${roomId}`);
      // Mark payment as failed if order exists
      await Payment.findOneAndUpdate({ razorpayOrderId }, { status: 'failed' });
      throw new Error('Payment verification failed. Security mismatch.');
    }

    console.log(`[PAYMENT] Signature valid for Room: ${roomId}. Publishing room...`);
    
    // Update Payment Record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'captured' }
    );

    // Publish the room via RoomService
    return await RoomService.publishRoom(roomId, razorpayPaymentId, razorpayOrderId);
  }

  /**
   * Handle Razorpay Webhooks (to ensure delivery even if UI fails)
   */
  static async handleWebhook(signature, rawBody, payload) {
    console.log('[PAYMENT] Received Razorpay Webhook');
    
    if (!config.razorpay.isConfigured) return;

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('[PAYMENT] RAZORPAY_WEBHOOK_SECRET not set. Skipping webhook verification.');
        return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody || JSON.stringify(payload))
      .digest("hex");


    if (expectedSignature !== signature) {
      console.error('[PAYMENT ERROR] Invalid webhook signature');
      return;
    }

    const event = payload.event;
    if (event === 'payment.captured') {
      const orderId = payload.payload.payment.entity.order_id;
      const paymentId = payload.payload.payment.entity.id;
      const roomId = payload.payload.payment.entity.notes.roomId;

      console.log(`[PAYMENT WEBHOOK] Payment captured for Order: ${orderId}, Room: ${roomId}`);
      
      // Check if already published
      const room = await Room.findById(roomId);
      if (room && !room.isPublished) {
        // Use verifyPayment internally (it handles signature verification if called via API, 
        // but here we just pass the paymentId as it's already verified by webhook signature)
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { razorpayPaymentId: paymentId, status: 'captured' }
        );
        await RoomService.publishRoom(roomId, paymentId, orderId);
      }
    }
  }
}

module.exports = PaymentService;
