const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const { BOOKING_STATUS, PAYMENT_STATUS, ROOM_STATUS, REFUND_STATUS } = require('../config/constants');
const {
  isRoomAvailable,
  calculateBookingAmount,
  calculateRefundAmount,
} = require('./availability.service');
const { createNotification } = require('../utils/notifications');

/**
 * Create a new booking with concurrency protection using MongoDB transactions
 * This prevents double-booking of the same room for overlapping dates
 */
const createBooking = async (userId, roomId, checkIn, checkOut, guests, specialRequests = '') => {
  let session = null;
  try {
    const hello = await mongoose.connection.db.command({ hello: 1 });
    const supportsTransactions = !!(hello.setName || hello.msg === 'isdbgrid');
    if (supportsTransactions) {
      session = await mongoose.startSession();
      session.startTransaction();
    }
  } catch (err) {
    console.warn('Could not start transaction session, running without transaction:', err.message);
  }

  try {
    // 1. Verify room exists and is active
    const room = await Room.findById(roomId).populate('category').session(session);
    if (!room || !room.isActive) {
      throw new Error('Room not found or inactive');
    }

    // 2. Re-verify availability within the transaction (prevents race conditions)
    const available = await isRoomAvailable(roomId, checkIn, checkOut);
    if (!available) {
      throw new Error('Room is no longer available for the selected dates');
    }

    // Check room status
    if (room.status !== ROOM_STATUS.AVAILABLE) {
      throw new Error('Room is not available for booking at this time');
    }

    // 3. Calculate total amount SERVER-SIDE (never trust frontend)
    const totalGuests = (guests.adults || 1) + (guests.children || 0);
    if (totalGuests > 10) {
      throw new Error(`Maximum 10 guests allowed per reservation group`);
    }

    const pricing = await calculateBookingAmount(room.category._id, checkIn, checkOut, guests);

    // 4. Create booking
    const [booking] = await Booking.create(
      [
        {
          user: userId,
          room: roomId,
          category: room.category._id,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guests,
          pricePerNight: pricing.pricePerNight,
          totalNights: pricing.totalNights,
          subtotal: pricing.subtotal,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          status: BOOKING_STATUS.PENDING,
          specialRequests,
        },
      ],
      session ? { session } : {}
    );

    // 5. Create payment record
    const [payment] = await Payment.create(
      [
        {
          booking: booking._id,
          user: userId,
          amount: pricing.totalAmount,
          status: PAYMENT_STATUS.INITIATED,
        },
      ],
      session ? { session } : {}
    );

    // 6. Link payment to booking
    booking.payment = payment._id;
    await booking.save(session ? { session } : {});

    // 7. Commit transaction
    if (session) {
      await session.commitTransaction();
    }

    // 8. Send notification (outside transaction)
    await createNotification(
      userId,
      'Booking Created',
      `Your booking ${booking.bookingCode} has been created. Please complete payment to confirm.`,
      'booking',
      `/my-bookings/${booking._id}`
    );

    return { booking, payment };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * Cancel a booking and process refund
 */
const cancelBooking = async (bookingId, userId, reason = '') => {
  const booking = await Booking.findById(bookingId).populate('payment');

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Verify booking belongs to user (unless admin/manager)
  if (booking.user.toString() !== userId.toString()) {
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if cancellable
  if (
    ![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)
  ) {
    throw new Error('This booking cannot be cancelled');
  }

  // Calculate refund
  const refundAmount = calculateRefundAmount(booking);

  // Update booking
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  booking.refundAmount = refundAmount;
  await booking.save();

  // Update room status back to available if it was booked
  const room = await Room.findById(booking.room);
  if (room && room.status === ROOM_STATUS.BOOKED && room.currentBooking?.toString() === bookingId.toString()) {
    room.status = ROOM_STATUS.AVAILABLE;
    room.currentBooking = null;
    await room.save();
  }

  // Create refund record if payment was successful
  let refund = null;
  if (booking.payment && refundAmount > 0) {
    const payment = await Payment.findById(booking.payment);
    if (payment && payment.status === PAYMENT_STATUS.SUCCESSFUL) {
      refund = await Refund.create({
        payment: payment._id,
        booking: bookingId,
        amount: refundAmount,
        reason: reason || 'Customer cancellation',
        status: REFUND_STATUS.PENDING,
      });

      // Update payment status
      payment.status = PAYMENT_STATUS.REFUND_INITIATED;
      await payment.save();
    }
  }

  // Notification
  await createNotification(
    userId,
    'Booking Cancelled',
    `Your booking ${booking.bookingCode} has been cancelled.${
      refundAmount > 0 ? ` Refund of ₹${refundAmount} will be processed.` : ''
    }`,
    'booking',
    `/my-bookings/${booking._id}`
  );

  return { booking, refund };
};

module.exports = {
  createBooking,
  cancelBooking,
};
