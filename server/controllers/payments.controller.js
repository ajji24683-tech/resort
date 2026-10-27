const Payment = require('../models/Payment');
const { initiatePayment, verifyPayment } = require('../services/payment.service');

/**
 * @desc    Initiate payment for a booking
 * @route   POST /api/payments/initiate
 * @access  Private
 */
const initiate = async (req, res, next) => {
  try {
    const { bookingId, method } = req.body;
    const result = await initiatePayment(bookingId, req.user._id, method);

    res.status(200).json({
      success: true,
      message: 'Payment initiated',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Verify payment (mock webhook/callback)
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verify = async (req, res, next) => {
  try {
    const { paymentId, gatewayResponse } = req.body;
    const result = await verifyPayment(paymentId, gatewayResponse);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { payment: result.payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment status
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('booking', 'bookingCode status');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Authorization check
    if (
      payment.user.toString() !== req.user._id.toString() &&
      !['admin', 'manager'].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiate,
  verify,
  getPaymentStatus,
};
