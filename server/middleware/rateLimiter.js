const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX, // 100 requests per window
  skip: (req, res) => config.NODE_ENV === 'development',
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX, // 10 requests per window
  skip: (req, res) => config.NODE_ENV === 'development',
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
