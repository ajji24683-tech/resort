const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'net_banking', 'wallet', 'mock'],
      default: 'mock',
    },
    transactionId: {
      type: String,
      default: '',
    },
    gatewayOrderId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.INITIATED,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    verifiedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
