const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Protect routes - verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token expired.',
      });
    }
    next(error);
  }
};

/**
 * Optional auth - attach user if token present, but don't block if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Silently continue without user
  }
  next();
};

module.exports = { protect, optionalAuth };
