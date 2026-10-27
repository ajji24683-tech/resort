const mongoose = require('mongoose');
const { INSPECTION_STATUS } = require('../config/constants');

const inspectionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    cleaningTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CleaningTask',
      required: true,
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(INSPECTION_STATUS),
      default: INSPECTION_STATUS.PENDING,
    },
    issues: [
      {
        description: String,
        severity: { type: String, enum: ['minor', 'major', 'critical'], default: 'minor' },
      },
    ],
    notes: { type: String, default: '' },
    inspectedAt: Date,
  },
  { timestamps: true }
);

inspectionSchema.index({ room: 1, status: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
