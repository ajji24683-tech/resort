const mongoose = require('mongoose');

const bookingGuestSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    name: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
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
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingGuestSchema.index({ booking: 1 });

module.exports = mongoose.model('BookingGuest', bookingGuestSchema);
