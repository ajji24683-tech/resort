const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      maxlength: 100,
    },
    resource: {
      type: String,
      required: true,
      maxlength: 100,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    description: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Immutable - no updates or deletes
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
