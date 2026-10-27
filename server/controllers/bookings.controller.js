const Booking = require('../models/Booking');
const BookingGuest = require('../models/BookingGuest');
const Review = require('../models/Review');
const { createBooking, cancelBooking } = require('../services/booking.service');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
const createNewBooking = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;

    const result = await createBooking(
      req.user._id,
      roomId,
      checkIn,
      checkOut,
      guests || { adults: 1, children: 0 },
      specialRequests
    );

    res.status(201).json({
      success: true,
      message: 'Booking created. Please complete payment to confirm.',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('not available') || error.message.includes('no longer available')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('room', 'roomNumber floor')
      .populate('category', 'name images')
      .populate('payment', 'status amount transactionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking detail
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingDetail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'roomNumber floor status')
      .populate('category', 'name images amenities bedType roomSize')
      .populate('payment')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      !['admin', 'manager'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    // Get guests
    const guests = await BookingGuest.find({ booking: booking._id });

    // Check if review exists
    const review = await Review.findOne({ booking: booking._id });

    // Get refund if exists
    const Refund = require('../models/Refund');
    const refund = await Refund.findOne({ booking: booking._id });

    res.status(200).json({
      success: true,
      data: {
        booking,
        guests,
        review,
        refund,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   POST /api/bookings/:id/cancel
 * @access  Private
 */
const cancelUserBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await cancelBooking(req.params.id, req.user._id, reason);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message.includes('cannot be cancelled')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc    Add guest details to booking
 * @route   POST /api/bookings/:id/guests
 * @access  Private
 */
const addGuests = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { guests } = req.body; // Array of guest objects

    // Remove existing guests for this booking
    await BookingGuest.deleteMany({ booking: booking._id });

    // Add new guests
    const guestDocs = guests.map((g) => ({
      booking: booking._id,
      ...g,
    }));

    const savedGuests = await BookingGuest.insertMany(guestDocs);

    res.status(200).json({
      success: true,
      message: 'Guest details saved',
      data: { guests: savedGuests },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit review for a booking
 * @route   POST /api/bookings/:id/review
 * @access  Private
 */
const submitReview = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== BOOKING_STATUS.CHECKED_OUT) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after checkout',
      });
    }

    // Check existing review
    const existing = await Review.findOne({ booking: booking._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    const { rating, title, comment } = req.body;

    const review = await Review.create({
      booking: booking._id,
      user: req.user._id,
      room: booking.room,
      category: booking.category,
      rating,
      title,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNewBooking,
  getMyBookings,
  getBookingDetail,
  cancelUserBooking,
  addGuests,
  submitReview,
};
