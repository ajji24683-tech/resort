const mongoose = require('mongoose');
const { CLEANING_STATUS } = require('../config/constants');

const cleaningTaskSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(CLEANING_STATUS),
      default: CLEANING_STATUS.PENDING,
    },
    checklist: [
      {
        item: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    startedAt: Date,
    completedAt: Date,
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

cleaningTaskSchema.index({ room: 1, status: 1 });
cleaningTaskSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('CleaningTask', cleaningTaskSchema);
