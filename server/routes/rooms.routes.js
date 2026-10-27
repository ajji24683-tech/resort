const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { validate } = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');
const {
  getCategories,
  getCategoryDetail,
  searchRooms,
  getPublicReviews,
  getRoomDetail,
} = require('../controllers/rooms.controller');

// All public routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryDetail);
router.get('/reviews', getPublicReviews);

router.get(
  '/search',
  [
    query('checkIn').notEmpty().withMessage('Check-in date is required'),
    query('checkOut').notEmpty().withMessage('Check-out date is required'),
  ],
  validate,
  searchRooms
);

router.get('/:id', getRoomDetail);

module.exports = router;
