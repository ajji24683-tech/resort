const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Refund = require('../models/Refund');
const { PAYMENT_STATUS, BOOKING_STATUS, ROOM_STATUS, REFUND_STATUS } = require('../config/constants');
const { createNotification } = require('../utils/notifications');
const { AppError } = require('../middleware/errorHandler');

/**
 * Initiate payment for a booking
 * Creates a mock payment gateway order
 */
const initiatePayment = async (bookingId, userId, method = 'mock') => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.user.toString() !== userId.toString()) throw new AppError('Not authorized to access this booking', 403);
  if (booking.status !== BOOKING_STATUS.PENDING) throw new AppError('Booking is not in pending state', 400);

  let payment = await Payment.findById(booking.payment);
  if (!payment) {
    payment = await Payment.create({
      booking: bookingId,
      user: userId,
      amount: booking.totalAmount,
      method,
      status: PAYMENT_STATUS.INITIATED,
    });
    booking.payment = payment._id;
    await booking.save();
  }

  // Generate mock gateway order ID
  const gatewayOrderId = `MOCK_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  payment.gatewayOrderId = gatewayOrderId;
  payment.method = method;
  payment.status = PAYMENT_STATUS.PENDING;
  await payment.save();

  return {
    paymentId: payment._id,
    gatewayOrderId,
    amount: payment.amount,
    currency: 'INR',
  };
};

/**
 * Verify payment - SERVER-SIDE ONLY
 * Never trust payment status from frontend
 * In production: verify with payment gateway API / webhook
 */
const verifyPayment = async (paymentId, gatewayResponse) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);

  // ─── MOCK VERIFICATION ─────────────────────────────────────
  // In production, this would verify with Razorpay/Stripe API
  // using signatures, webhook data, etc.
  // We simulate verification: if transactionId is present, payment succeeds
  const isVerified = gatewayResponse && gatewayResponse.transactionId;

  if (isVerified) {
    payment.status = PAYMENT_STATUS.SUCCESSFUL;
    payment.transactionId = gatewayResponse.transactionId;
    payment.gatewayResponse = gatewayResponse;
    payment.verifiedAt = new Date();
    await payment.save();

    // Confirm the booking
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = BOOKING_STATUS.CONFIRMED;
      await booking.save();

      // Update room status
      const room = await Room.findById(booking.room);
      if (room) {
        room.status = ROOM_STATUS.BOOKED;
        room.currentBooking = booking._id;
        await room.save();
      }

      // Notification
      await createNotification(
        payment.user,
        'Payment Successful',
        `Payment of ₹${payment.amount} for booking ${booking.bookingCode} confirmed.`,
        'payment',
        `/my-bookings/${booking._id}`
      );
    }

    return { success: true, payment, message: 'Payment verified successfully' };
  } else {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = gatewayResponse?.error || 'Payment verification failed';
    payment.gatewayResponse = gatewayResponse;
    await payment.save();

    return { success: false, payment, message: 'Payment verification failed' };
  }
};

/**
 * Process a refund (admin/manager action)
 */
const processRefund = async (refundId, processedBy, targetStatus = REFUND_STATUS.PROCESSED) => {
  const refund = await Refund.findById(refundId);
  if (!refund) throw new AppError('Refund not found', 404);

  refund.status = targetStatus;
  refund.processedAt = new Date();
  refund.processedBy = processedBy;
  if (targetStatus === REFUND_STATUS.PROCESSED) {
    refund.transactionId = `REFUND_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
  await refund.save();

  // Update payment status if processed
  if (targetStatus === REFUND_STATUS.PROCESSED) {
    const payment = await Payment.findById(refund.payment);
    if (payment) {
      payment.status = PAYMENT_STATUS.REFUNDED;
      await payment.save();
    }
  }

  // Notification
  const booking = await Booking.findById(refund.booking);
  if (booking) {
    await createNotification(
      booking.user,
      targetStatus === REFUND_STATUS.PROCESSED ? 'Refund Processed' : 'Refund Updated',
      `Refund of ₹${refund.amount} for booking ${booking.bookingCode} is now ${targetStatus}.`,
      'payment',
      `/my-bookings/${booking._id}`
    );
  }

  return refund;
};

module.exports = {
  initiatePayment,
  verifyPayment,
  processRefund,
};
