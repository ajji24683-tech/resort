const Room = require('../models/Room');
const CleaningTask = require('../models/CleaningTask');
const Inspection = require('../models/Inspection');
const MaintenanceIssue = require('../models/MaintenanceIssue');
const Booking = require('../models/Booking');
const Setting = require('../models/Setting');
const { ROOM_STATUS, CLEANING_STATUS, INSPECTION_STATUS, MAINTENANCE_STATUS, BOOKING_STATUS, DEFAULT_SETTINGS } = require('../config/constants');
const { createNotification } = require('../utils/notifications');

/**
 * Handle room checkout event
 * 1. Mark booking as checked_out
 * 2. Set checkout timestamp
 * 3. Update room status to checkout_pending
 * 4. Apply grace period before triggering cleaning_required (or create it immediately)
 */
const checkOutGuest = async (bookingId, staffId) => {
  const booking = await Booking.findById(bookingId).populate('room');
  if (!booking) throw new Error('Booking not found');
  if (booking.status !== BOOKING_STATUS.CHECKED_IN) {
    throw new Error('Guest must be checked in to check out');
  }

  // 1. Update booking details
  booking.status = BOOKING_STATUS.CHECKED_OUT;
  booking.checkedOutAt = new Date();
  await booking.save();

  // 2. Update room status
  const room = await Room.findById(booking.room._id);
  room.status = ROOM_STATUS.CHECKOUT_PENDING;
  room.currentBooking = null; // Free room for future bookings
  await room.save();

  // 3. Create cleaning task immediately (grace period configuration is loaded from settings)
  const gracePeriodSetting = await Setting.findOne({ key: 'GRACE_PERIOD_HOURS' });
  const graceHours = gracePeriodSetting ? parseInt(gracePeriodSetting.value) : DEFAULT_SETTINGS.GRACE_PERIOD_HOURS;

  // For simulation: we create the cleaning task immediately in state 'pending'
  const task = await CleaningTask.create({
    room: room._id,
    booking: bookingId,
    status: CLEANING_STATUS.PENDING,
    checklist: [
      { item: 'Change bed linens and pillows', completed: false },
      { item: 'Dust and wipe all surfaces/furniture', completed: false },
      { item: 'Clean bathroom, replenish towels & toiletries', completed: false },
      { item: 'Vacuum rugs and mop floor', completed: false },
      { item: 'Check all electrical appliances (AC, TV, lights)', completed: false },
      { item: 'Sanitize high-touch surfaces', completed: false },
    ],
  });

  // Transition room to cleaning_required
  room.status = ROOM_STATUS.CLEANING_REQUIRED;
  await room.save();

  // Notify Housekeeping manager / staff
  // Search for housekeeping staff if any (handled at frontend or assignment time)

  return { booking, room, cleaningTask: task };
};

/**
 * Handle room check-in event
 */
const checkInGuest = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate('room');
  if (!booking) throw new Error('Booking not found');
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw new Error('Booking must be confirmed (and paid) to check in');
  }

  const room = await Room.findById(booking.room._id);
  if (room.status !== ROOM_STATUS.AVAILABLE && room.status !== ROOM_STATUS.BOOKED) {
    throw new Error(`Room is currently in state '${room.status}' and not available for check-in yet.`);
  }

  // Update booking
  booking.status = BOOKING_STATUS.CHECKED_IN;
  booking.checkedInAt = new Date();
  await booking.save();

  // Update room
  room.status = ROOM_STATUS.OCCUPIED;
  room.currentBooking = booking._id;
  await room.save();

  return { booking, room };
};

/**
 * Assign cleaning task to housekeeper
 */
const assignCleaner = async (taskId, staffId) => {
  const task = await CleaningTask.findById(taskId);
  if (!task) throw new Error('Cleaning task not found');

  task.assignedTo = staffId;
  task.status = CLEANING_STATUS.IN_PROGRESS;
  task.startedAt = new Date();
  await task.save();

  // Update physical room status
  const room = await Room.findById(task.room);
  room.status = ROOM_STATUS.CLEANING_IN_PROGRESS;
  await room.save();

  await createNotification(
    staffId,
    'New Cleaning Task Assigned',
    `You have been assigned to clean Room ${room.roomNumber}`,
    'cleaning',
    `/manager/cleaning`
  );

  return { task, room };
};

/**
 * Complete cleaning task
 */
const completeCleaning = async (taskId, checklist, notes = '') => {
  const task = await CleaningTask.findById(taskId);
  if (!task) throw new Error('Cleaning task not found');

  task.status = CLEANING_STATUS.COMPLETED;
  task.checklist = checklist;
  task.completedAt = new Date();
  task.notes = notes;
  await task.save();

  // Update physical room status to inspection_pending
  const room = await Room.findById(task.room);
  room.status = ROOM_STATUS.INSPECTION_PENDING;
  await room.save();

  // Create inspection record
  const inspection = await Inspection.create({
    room: room._id,
    cleaningTask: taskId,
    status: INSPECTION_STATUS.PENDING,
  });

  return { task, room, inspection };
};

/**
 * Submit inspection results (Pass, Fail, or Flag Maintenance)
 */
const submitInspection = async (inspectionId, inspectorId, status, issues = [], notes = '') => {
  const inspection = await Inspection.findById(inspectionId);
  if (!inspection) throw new Error('Inspection not found');

  inspection.inspectedBy = inspectorId;
  inspection.status = status;
  inspection.issues = issues;
  inspection.notes = notes;
  inspection.inspectedAt = new Date();
  await inspection.save();

  const room = await Room.findById(inspection.room);
  
  if (status === INSPECTION_STATUS.PASSED) {
    // Room goes back to available state
    room.status = ROOM_STATUS.AVAILABLE;
    room.lastCleaned = new Date();
    room.lastInspected = new Date();
    await room.save();
  } else if (status === INSPECTION_STATUS.FAILED) {
    // Fail: Room goes back to cleaning_required
    room.status = ROOM_STATUS.CLEANING_REQUIRED;
    await room.save();

    // Recreate a cleaning task linked to same room
    await CleaningTask.create({
      room: room._id,
      booking: inspection.cleaningTask.booking || null,
      status: CLEANING_STATUS.PENDING,
      priority: 'high',
      notes: `Re-cleaning required. Inspection failed: ${notes}`,
      checklist: [
        { item: 'Change bed linens and pillows', completed: false },
        { item: 'Dust and wipe all surfaces/furniture', completed: false },
        { item: 'Clean bathroom, replenish towels & toiletries', completed: false },
        { item: 'Vacuum rugs and mop floor', completed: false },
        { item: 'Check all electrical appliances (AC, TV, lights)', completed: false },
        { item: 'Sanitize high-touch surfaces', completed: false },
      ],
    });
  }

  return { inspection, room };
};

/**
 * Flag Maintenance issue for a room
 */
const reportMaintenanceIssue = async (roomId, reporterId, category, description, priority) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error('Room not found');

  const issue = await MaintenanceIssue.create({
    room: roomId,
    reportedBy: reporterId,
    category,
    description,
    priority,
    status: MAINTENANCE_STATUS.REPORTED,
  });

  // Transition room status to maintenance
  room.status = ROOM_STATUS.MAINTENANCE;
  await room.save();

  return { issue, room };
};

/**
 * Resolve/Complete Maintenance issue
 */
const resolveMaintenanceIssue = async (issueId, staffId, notes = '', actualCost = 0) => {
  const issue = await MaintenanceIssue.findById(issueId);
  if (!issue) throw new Error('Maintenance issue not found');

  issue.status = MAINTENANCE_STATUS.COMPLETED;
  issue.resolvedAt = new Date();
  issue.actualCost = actualCost;
  issue.notes = notes;
  await issue.save();

  return issue;
};

/**
 * Verify Maintenance completion (returns room to Available)
 */
const verifyMaintenanceIssue = async (issueId, verifierId) => {
  const issue = await MaintenanceIssue.findById(issueId);
  if (!issue) throw new Error('Maintenance issue not found');

  issue.status = MAINTENANCE_STATUS.VERIFIED;
  issue.verifiedBy = verifierId;
  issue.verifiedAt = new Date();
  await issue.save();

  const room = await Room.findById(issue.room);
  
  // Return room to available if there are no other open maintenance issues
  const openIssues = await MaintenanceIssue.countDocuments({
    room: room._id,
    status: { $in: [MAINTENANCE_STATUS.REPORTED, MAINTENANCE_STATUS.IN_PROGRESS, MAINTENANCE_STATUS.COMPLETED] },
  });

  if (openIssues === 0) {
    room.status = ROOM_STATUS.AVAILABLE;
    await room.save();
  }

  return { issue, room };
};

module.exports = {
  checkOutGuest,
  checkInGuest,
  assignCleaner,
  completeCleaning,
  submitInspection,
  reportMaintenanceIssue,
  resolveMaintenanceIssue,
  verifyMaintenanceIssue,
};
