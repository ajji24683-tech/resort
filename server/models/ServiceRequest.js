const mongoose = require('mongoose');
const { SERVICE_REQUEST_STATUS } = require('../config/constants');

const serviceRequestSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['room_service', 'housekeeping', 'laundry', 'transport', 'spa', 'dining', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(SERVICE_REQUEST_STATUS),
      default: SERVICE_REQUEST_STATUS.PENDING,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ booking: 1 });
serviceRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
