// ─── User Roles ──────────────────────────────────────────────
const ROLES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  ADMIN: 'admin',
  STAFF: 'staff',
};

// ─── Room Statuses ───────────────────────────────────────────
const ROOM_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  OCCUPIED: 'occupied',
  CHECKOUT_PENDING: 'checkout_pending',
  CLEANING_REQUIRED: 'cleaning_required',
  CLEANING_IN_PROGRESS: 'cleaning_in_progress',
  INSPECTION_PENDING: 'inspection_pending',
  MAINTENANCE: 'maintenance',
  BLOCKED: 'blocked',
};

// ─── Booking Statuses ────────────────────────────────────────
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// ─── Payment Statuses ────────────────────────────────────────
const PAYMENT_STATUS = {
  INITIATED: 'initiated',
  PENDING: 'pending',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  REFUND_INITIATED: 'refund_initiated',
  REFUNDED: 'refunded',
};

// ─── Refund Statuses ─────────────────────────────────────────
const REFUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSED: 'processed',
  REJECTED: 'rejected',
};

// ─── Cleaning Task Statuses ──────────────────────────────────
const CLEANING_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// ─── Inspection Statuses ─────────────────────────────────────
const INSPECTION_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
};

// ─── Maintenance Statuses ────────────────────────────────────
const MAINTENANCE_STATUS = {
  REPORTED: 'reported',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
};

// ─── Maintenance Priority ────────────────────────────────────
const MAINTENANCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// ─── Attendance Statuses ─────────────────────────────────────
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
};

// ─── Service Request Statuses ────────────────────────────────
const SERVICE_REQUEST_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ─── Complaint Statuses ──────────────────────────────────────
const COMPLAINT_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
};

// ─── Notification Types ──────────────────────────────────────
const NOTIFICATION_TYPE = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  REVIEW: 'review',
  SYSTEM: 'system',
  ALERT: 'alert',
};

// ─── Staff Types ─────────────────────────────────────────────
const STAFF_TYPE = {
  HOUSEKEEPING: 'housekeeping',
  MAINTENANCE: 'maintenance',
  FRONT_DESK: 'front_desk',
  MANAGEMENT: 'management',
  SECURITY: 'security',
  FOOD_SERVICE: 'food_service',
};

// ─── Default Settings ────────────────────────────────────────
const DEFAULT_SETTINGS = {
  GRACE_PERIOD_HOURS: 2,
  CANCELLATION_FREE_HOURS: 24,
  CANCELLATION_PENALTY_PERCENT: 20,
  CHECK_IN_TIME: '14:00',
  CHECK_OUT_TIME: '11:00',
  MAX_GUESTS_PER_ROOM: 4,
  TAX_PERCENT: 18,
  MIN_BOOKING_ADVANCE_HOURS: 6,
};

module.exports = {
  ROLES,
  ROOM_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  REFUND_STATUS,
  CLEANING_STATUS,
  INSPECTION_STATUS,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
  ATTENDANCE_STATUS,
  SERVICE_REQUEST_STATUS,
  COMPLAINT_STATUS,
  NOTIFICATION_TYPE,
  STAFF_TYPE,
  DEFAULT_SETTINGS,
};
