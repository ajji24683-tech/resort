const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, STAFF_TYPE } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      sparse: true,
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
      default: '',
    },
    age: {
      type: Number,
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    staffType: {
      type: String,
      enum: Object.values(STAFF_TYPE),
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [250, 'Address cannot exceed 250 characters'],
      default: '',
    },
    idType: {
      type: String,
      enum: ['passport', 'driving_license', 'national_id', 'aadhar', ''],
      default: '',
    },
    idNumber: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return true; // If user logged in via phone without password
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
