const mongoose = require('mongoose');

const roomPriceSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: [true, 'Room category is required'],
    },
    seasonName: {
      type: String,
      required: [true, 'Season name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    weekendSurcharge: {
      type: Number,
      default: 0,
      min: [0, 'Surcharge cannot be negative'],
    },
    extraGuestCharge: {
      type: Number,
      default: 0,
      min: [0, 'Extra guest charge cannot be negative'],
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

// Indexes
roomPriceSchema.index({ category: 1, startDate: 1, endDate: 1 });
roomPriceSchema.index({ isActive: 1 });

module.exports = mongoose.model('RoomPrice', roomPriceSchema);
