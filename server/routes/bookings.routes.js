const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  createNewBooking,
  getMyBookings,
  getBookingDetail,
  cancelUserBooking,
  addGuests,
  submitReview,
} = require('../controllers/bookings.controller');

// All routes require authentication
router.use(protect);

router.post(
  '/',
  [
    body('roomId').notEmpty().withMessage('Room ID is required'),
    body('checkIn').notEmpty().withMessage('Check-in date is required'),
    body('checkOut').notEmpty().withMessage('Check-out date is required'),
  ],
  validate,
  createNewBooking
);

router.get('/my', getMyBookings);
router.get('/:id', getBookingDetail);

router.post(
  '/:id/cancel',
  [body('reason').optional().trim()],
  validate,
  cancelUserBooking
);

router.post(
  '/:id/guests',
  [body('guests').isArray().withMessage('Guests must be an array')],
  validate,
  addGuests
);

router.post(
  '/:id/review',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ],
  validate,
  submitReview
);

module.exports = router;
