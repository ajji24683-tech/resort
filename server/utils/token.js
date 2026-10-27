const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT token for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

module.exports = { generateToken };
