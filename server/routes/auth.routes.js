const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  checkPhone,
  phoneLogin,
  phoneRegister,
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller');

// Customer Phone-First Flow
router.post(
  '/phone-check',
  authLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Mobile number is required'),
  ],
  validate,
  checkPhone
);

router.post(
  '/phone-login',
  authLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Mobile number is required'),
  ],
  validate,
  phoneLogin
);

router.post(
  '/phone-register',
  authLimiter,
  [
    body('phone').trim().notEmpty().withMessage('Mobile number is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  validate,
  phoneRegister
);

// Traditional / Admin / Staff email-password routes
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Protected routes
router.get('/me', protect, getMe);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
  ],
  validate,
  updateProfile
);

router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

module.exports = router;
