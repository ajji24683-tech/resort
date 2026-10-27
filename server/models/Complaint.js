const mongoose = require('mongoose');
const { COMPLAINT_STATUS } = require('../config/constants');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.OPEN,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: { type: String, default: '' },
    resolvedAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1 });
complaintSchema.index({ user: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
