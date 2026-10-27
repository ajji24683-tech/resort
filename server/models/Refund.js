const mongoose = require('mongoose');
const { REFUND_STATUS } = require('../config/constants');

const refundSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment is required'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
    },
    status: {
      type: String,
      enum: Object.values(REFUND_STATUS),
      default: REFUND_STATUS.PENDING,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

refundSchema.index({ booking: 1 });
refundSchema.index({ payment: 1 });
refundSchema.index({ status: 1 });

module.exports = mongoose.model('Refund', refundSchema);
