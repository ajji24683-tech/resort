const mongoose = require('mongoose');
const { MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require('../config/constants');

const maintenanceIssueSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'furniture', 'ac_heating', 'structural', 'appliance', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: Object.values(MAINTENANCE_PRIORITY),
      default: MAINTENANCE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.REPORTED,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    resolvedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    images: [{ type: String }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

maintenanceIssueSchema.index({ room: 1, status: 1 });
maintenanceIssueSchema.index({ assignedTo: 1, status: 1 });
maintenanceIssueSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('MaintenanceIssue', maintenanceIssueSchema);
