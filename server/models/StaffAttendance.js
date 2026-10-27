const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const staffAttendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },
    hoursWorked: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
