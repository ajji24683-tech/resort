const mongoose = require('mongoose');
const { ROOM_STATUS } = require('../config/constants');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: [true, 'Room category is required'],
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
      min: [0, 'Floor cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.AVAILABLE,
    },
    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    lastCleaned: {
      type: Date,
    },
    lastInspected: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for availability queries
roomSchema.index({ category: 1, status: 1, isActive: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);
