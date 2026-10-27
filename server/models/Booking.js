const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: [true, 'Room category is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    totalNights: {
      type: Number,
      required: true,
      min: [1, 'Minimum 1 night booking'],
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    specialRequests: {
      type: String,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    checkedInAt: {
      type: Date,
    },
    checkedOutAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate booking code
bookingSchema.pre('validate', function () {
  if (!this.bookingCode) {
    const prefix = 'YR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingCode = `${prefix}-${timestamp}-${random}`;
  }
});

// Critical index for overlap detection
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1, checkIn: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
