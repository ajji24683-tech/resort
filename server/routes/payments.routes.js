const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { initiate, verify, getPaymentStatus } = require('../controllers/payments.controller');

router.use(protect);

router.post(
  '/initiate',
  [body('bookingId').notEmpty().withMessage('Booking ID is required')],
  validate,
  initiate
);

router.post(
  '/verify',
  [
    body('paymentId').notEmpty().withMessage('Payment ID is required'),
    body('gatewayResponse').notEmpty().withMessage('Gateway response is required'),
  ],
  validate,
  verify
);

router.get('/:id', getPaymentStatus);

module.exports = router;
