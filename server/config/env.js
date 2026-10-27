const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5005,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/yashiii_resort',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PAYMENT_SECRET: process.env.PAYMENT_SECRET || 'mock_payment_secret',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
};
