const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { AppError } = require('../middleware/errorHandler');

/**
 * Helper to normalize phone number string (remove spaces, dashes, brackets)
 */
const cleanPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)]/g, '');
};

/**
 * @desc    Check if phone number is already registered
 * @route   POST /api/auth/phone-check
 * @access  Public
 */
const checkPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const normalized = cleanPhone(phone);

    if (!normalized || normalized.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number.',
      });
    }

    // Match exact or contains normalized string
    const user = await User.findOne({
      $or: [
        { phone: normalized },
        { phone: phone.trim() },
      ],
    });

    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          exists: true,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        exists: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Phone-first Login for existing customer
 * @route   POST /api/auth/phone-login
 * @access  Public
 */
const phoneLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const normalized = cleanPhone(phone);

    const user = await User.findOne({
      $or: [
        { phone: normalized },
        { phone: phone.trim() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this mobile number. Please sign up.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact concierge.',
      });
    }

    // If password was provided by user, verify it
    if (password && user.password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password for this mobile number.',
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Phone-first Register for new customer (Name, Address / City, Contact, Age)
 * @route   POST /api/auth/phone-register
 * @access  Public
 */
const phoneRegister = async (req, res, next) => {
  try {
    const { phone, name, address, occupation, age, email, password } = req.body;
    const normalized = cleanPhone(phone);

    if (!normalized || !name) {
      return res.status(400).json({
        success: false,
        message: 'Full Name and Mobile Number are required.',
      });
    }

    // Check if phone already exists
    const existing = await User.findOne({
      $or: [
        { phone: normalized },
        { phone: phone.trim() },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please log in.',
      });
    }

    // Generate safe email if none provided
    const userEmail = email && email.trim() ? email.toLowerCase().trim() : `guest_${normalized}@ajiisresort.com`;
    const userPassword = password || `Ajiis@${normalized.slice(-4)}`;

    const user = await User.create({
      name: name.trim(),
      phone: normalized,
      address: address ? address.trim() : (occupation ? occupation.trim() : ''),
      occupation: occupation ? occupation.trim() : '',
      age: age ? parseInt(age, 10) : undefined,
      email: userEmail,
      password: userPassword,
      role: 'customer',
      isVerified: true,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: `Welcome to Ajiis Resort, ${user.name}!`,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new customer (Traditional / Email)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, occupation, age } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user (role defaults to 'customer')
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: cleanPhone(phone),
      address: address ? address.trim() : (occupation ? occupation.trim() : ''),
      occupation: occupation ? occupation.trim() : '',
      age: age ? parseInt(age, 10) : undefined,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (Email/Password for Staff/Admin/Customer)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Contact support.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, occupation, age, address, idType, idNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone: cleanPhone(phone),
        occupation,
        age: age ? parseInt(age, 10) : undefined,
        address,
        idType,
        idNumber,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkPhone,
  phoneLogin,
  phoneRegister,
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
