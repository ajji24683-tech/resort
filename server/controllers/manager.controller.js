const Room = require('../models/Room');
const RoomCategory = require('../models/RoomCategory');
const RoomPrice = require('../models/RoomPrice');
const Booking = require('../models/Booking');
const CleaningTask = require('../models/CleaningTask');
const Inspection = require('../models/Inspection');
const MaintenanceIssue = require('../models/MaintenanceIssue');
const StaffAttendance = require('../models/StaffAttendance');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const User = require('../models/User');
const { ROOM_STATUS, BOOKING_STATUS, CLEANING_STATUS, INSPECTION_STATUS, MAINTENANCE_STATUS } = require('../config/constants');
const workflow = require('../services/roomWorkflow.service');

/**
 * @desc    Get manager dashboard statistics
 * @route   GET /api/manager/dashboard
 * @access  Private (Manager / Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const utcStartOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const utcEndOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const minToday = startOfDay < utcStartOfDay ? startOfDay : utcStartOfDay;
    const maxToday = endOfDay > utcEndOfDay ? endOfDay : utcEndOfDay;

    // Occupancy
    const totalRoomsCount = await Room.countDocuments({ isActive: true });
    const occupiedRoomsCount = await Room.countDocuments({
      status: { $in: [ROOM_STATUS.OCCUPIED, ROOM_STATUS.BOOKED] },
      isActive: true,
    });
    const occupancyPercentage = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;

    // Room Status breakdown
    const roomsByStatus = await Room.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = roomsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Bookings and Check-ins/outs
    const todayCheckIns = await Booking.countDocuments({
      checkIn: { $gte: minToday, $lte: maxToday },
      status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING, BOOKING_STATUS.CHECKED_IN] },
    });
    
    const todayCheckOuts = await Booking.countDocuments({
      checkOut: { $gte: minToday, $lte: maxToday },
      status: { $in: [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CHECKED_OUT] },
    });

    // Revenue today (from payments)
    const Payment = require('../models/Payment');
    const revenueToday = await Payment.aggregate([
      { $match: { status: 'successful', createdAt: { $gte: minToday, $lte: maxToday } } },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ]);

    // Active Cleaning Tasks
    const pendingCleaning = await CleaningTask.countDocuments({ status: CLEANING_STATUS.PENDING });
    const cleaningInProgress = await CleaningTask.countDocuments({ status: CLEANING_STATUS.IN_PROGRESS });

    // Active Maintenance Issues
    const openMaintenance = await MaintenanceIssue.countDocuments({
      status: { $in: [MAINTENANCE_STATUS.REPORTED, MAINTENANCE_STATUS.IN_PROGRESS] },
    });

    // Open Service Requests
    const openRequests = await ServiceRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        occupancy: {
          total: totalRoomsCount,
          occupied: occupiedRoomsCount,
          percentage: occupancyPercentage,
        },
        roomStatusBreakdown: {
          available: statusMap[ROOM_STATUS.AVAILABLE] || 0,
          booked: statusMap[ROOM_STATUS.BOOKED] || 0,
          occupied: statusMap[ROOM_STATUS.OCCUPIED] || 0,
          dirty: statusMap[ROOM_STATUS.CLEANING_REQUIRED] || 0,
          cleaning: statusMap[ROOM_STATUS.CLEANING_IN_PROGRESS] || 0,
          inspection: statusMap[ROOM_STATUS.INSPECTION_PENDING] || 0,
          maintenance: statusMap[ROOM_STATUS.MAINTENANCE] || 0,
        },
        todayActivity: {
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
        },
        revenueToday: revenueToday[0]?.amount || 0,
        alerts: {
          pendingCleaning,
          cleaningInProgress,
          openMaintenance,
          openRequests,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings for management
 * @route   GET /api/manager/bookings
 * @access  Private (Manager / Admin)
 */
const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.bookingCode) query.bookingCode = new RegExp(req.query.bookingCode, 'i');

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('room', 'roomNumber floor status')
      .populate('category', 'name')
      .sort({ checkIn: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check-in a guest
 * @route   POST /api/manager/bookings/:id/checkin
 * @access  Private (Manager / Admin)
 */
const checkInBooking = async (req, res, next) => {
  try {
    const result = await workflow.checkInGuest(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Guest checked in successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Check-out a guest
 * @route   POST /api/manager/bookings/:id/checkout
 * @access  Private (Manager / Admin)
 */
const checkOutBooking = async (req, res, next) => {
  try {
    const result = await workflow.checkOutGuest(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Guest checked out successfully. Cleaning task created.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Assign or reassign room number to customer's booking
 * @route   POST /api/manager/bookings/:id/assign-room
 * @access  Private (Manager / Admin)
 */
const assignRoomToBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const newRoom = await Room.findById(roomId).populate('category');
    if (!newRoom || !newRoom.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive room unit' });
    }

    const oldRoomId = booking.room;
    booking.room = newRoom._id;
    booking.category = newRoom.category._id;
    await booking.save();

    if (booking.status === 'checked_in') {
      if (oldRoomId && oldRoomId.toString() !== newRoom._id.toString()) {
        await Room.findByIdAndUpdate(oldRoomId, { status: 'available', currentBooking: null });
      }
      newRoom.status = 'occupied';
      newRoom.currentBooking = booking._id;
      await newRoom.save();
    }

    const updated = await Booking.findById(id)
      .populate('room', 'roomNumber floor status')
      .populate('category', 'name')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Room #${newRoom.roomNumber} assigned to Booking ${booking.bookingCode} successfully.`,
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get room categories
 * @route   GET /api/manager/categories
 * @access  Private (Manager / Admin)
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find().sort({ basePrice: 1 });
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create room category
 * @route   POST /api/manager/categories
 * @access  Private (Manager / Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.create(req.body);
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room category
 * @route   PUT /api/manager/categories/:id
 * @access  Private (Manager / Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get physical rooms list
 * @route   GET /api/manager/rooms
 * @access  Private (Manager / Admin)
 */
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate('category').sort({ roomNumber: 1 });
    res.status(200).json({ success: true, data: { rooms } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create physical room
 * @route   POST /api/manager/rooms
 * @access  Private (Manager / Admin)
 */
const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update physical room
 * @route   PUT /api/manager/rooms/:id
 * @access  Private (Manager / Admin)
 */
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pricing rules list
 * @route   GET /api/manager/pricing
 * @access  Private (Manager / Admin)
 */
const getPricingRules = async (req, res, next) => {
  try {
    const rules = await RoomPrice.find().populate('category').sort({ startDate: 1 });
    res.status(200).json({ success: true, data: { rules } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create pricing rule
 * @route   POST /api/manager/pricing
 * @access  Private (Manager / Admin)
 */
const createPricingRule = async (req, res, next) => {
  try {
    const rule = await RoomPrice.create(req.body);
    res.status(201).json({ success: true, data: { rule } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update pricing rule
 * @route   PUT /api/manager/pricing/:id
 * @access  Private (Manager / Admin)
 */
const updatePricingRule = async (req, res, next) => {
  try {
    const rule = await RoomPrice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: { rule } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete pricing rule
 * @route   DELETE /api/manager/pricing/:id
 * @access  Private (Manager / Admin)
 */
const deletePricingRule = async (req, res, next) => {
  try {
    await RoomPrice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Pricing rule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff members list
 * @route   GET /api/manager/staff
 * @access  Private (Manager / Admin)
 */
const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['staff', 'manager'] } }).sort({ name: 1 });
    res.status(200).json({ success: true, data: { staff } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record staff attendance
 * @route   POST /api/manager/attendance
 * @access  Private (Manager / Admin)
 */
const recordAttendance = async (req, res, next) => {
  try {
    const { staffId, date, checkIn, checkOut, status, notes } = req.body;
    
    let attendance = await StaffAttendance.findOne({ staff: staffId, date: new Date(date) });
    if (attendance) {
      if (checkIn) attendance.checkIn = new Date(checkIn);
      if (checkOut) attendance.checkOut = new Date(checkOut);
      if (status) attendance.status = status;
      if (notes) attendance.notes = notes;
      await attendance.save();
    } else {
      attendance = await StaffAttendance.create({
        staff: staffId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        status,
        notes,
      });
    }

    res.status(200).json({ success: true, data: { attendance } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff attendance list
 * @route   GET /api/manager/attendance
 * @access  Private (Manager / Admin)
 */
const getAttendanceList = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0,0,0,0);
    const attendance = await StaffAttendance.find({ date }).populate('staff', 'name email staffType');
    res.status(200).json({ success: true, data: { attendance } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active cleaning tasks
 * @route   GET /api/manager/cleaning
 * @access  Private (Manager / Admin)
 */
const getCleaningTasks = async (req, res, next) => {
  try {
    const tasks = await CleaningTask.find()
      .populate('room', 'roomNumber floor status')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign cleaning task
 * @route   POST /api/manager/cleaning/:id/assign
 * @access  Private (Manager / Admin)
 */
const assignCleaning = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    const result = await workflow.assignCleaner(req.params.id, staffId);
    res.status(200).json({
      success: true,
      message: 'Housekeeper assigned successfully. Cleaning in progress.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Complete cleaning task
 * @route   POST /api/manager/cleaning/:id/complete
 * @access  Private (Manager / Admin)
 */
const completeCleaningTask = async (req, res, next) => {
  try {
    const { checklist, notes } = req.body;
    const result = await workflow.completeCleaning(req.params.id, checklist, notes);
    res.status(200).json({
      success: true,
      message: 'Cleaning completed. Room queued for inspection.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get pending inspections
 * @route   GET /api/manager/inspections
 * @access  Private (Manager / Admin)
 */
const getInspections = async (req, res, next) => {
  try {
    const inspections = await Inspection.find({ status: INSPECTION_STATUS.PENDING })
      .populate('room', 'roomNumber floor status')
      .populate('cleaningTask');
    res.status(200).json({ success: true, data: { inspections } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit inspection results
 * @route   POST /api/manager/inspections/:id/submit
 * @access  Private (Manager / Admin)
 */
const submitInspectionResults = async (req, res, next) => {
  try {
    const { status, issues, notes } = req.body;
    const result = await workflow.submitInspection(req.params.id, req.user._id, status, issues, notes);
    res.status(200).json({
      success: true,
      message: `Inspection processed with state '${status}'`,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get maintenance issues
 * @route   GET /api/manager/maintenance
 * @access  Private (Manager / Admin)
 */
const getMaintenanceIssues = async (req, res, next) => {
  try {
    const issues = await MaintenanceIssue.find()
      .populate('room', 'roomNumber floor status')
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { issues } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report maintenance issue
 * @route   POST /api/manager/maintenance
 * @access  Private (Manager / Admin)
 */
const createMaintenanceIssue = async (req, res, next) => {
  try {
    const { roomId, category, description, priority } = req.body;
    const result = await workflow.reportMaintenanceIssue(roomId, req.user._id, category, description, priority);
    res.status(201).json({
      success: true,
      message: 'Maintenance issue reported successfully. Room set to maintenance state.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Assign maintenance issue
 * @route   POST /api/manager/maintenance/:id/assign
 * @access  Private (Manager / Admin)
 */
const assignMaintenance = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    const issue = await MaintenanceIssue.findByIdAndUpdate(
      req.params.id,
      { assignedTo: staffId, status: MAINTENANCE_STATUS.IN_PROGRESS },
      { new: true }
    );
    res.status(200).json({ success: true, data: { issue } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve/Complete maintenance issue
 * @route   POST /api/manager/maintenance/:id/resolve
 * @access  Private (Manager / Admin)
 */
const resolveMaintenance = async (req, res, next) => {
  try {
    const { notes, actualCost } = req.body;
    const issue = await workflow.resolveMaintenanceIssue(req.params.id, req.user._id, notes, actualCost);
    res.status(200).json({
      success: true,
      message: 'Maintenance issue resolved. Verification pending.',
      data: { issue },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify maintenance completion
 * @route   POST /api/manager/maintenance/:id/verify
 * @access  Private (Manager / Admin)
 */
const verifyMaintenance = async (req, res, next) => {
  try {
    const result = await workflow.verifyMaintenanceIssue(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Maintenance verified. Room is now available.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get guest reviews list for manager response
 * @route   GET /api/manager/reviews
 * @access  Private (Manager / Admin)
 */
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('category', 'name')
      .populate('booking', 'bookingCode checkIn checkOut')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Respond to review
 * @route   POST /api/manager/reviews/:id/reply
 * @access  Private (Manager / Admin)
 */
const replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { managerReply: reply, repliedAt: new Date(), repliedBy: req.user._id },
      { new: true }
    );
    res.status(200).json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get guest service requests list
 * @route   GET /api/manager/service-requests
 * @access  Private (Manager / Admin)
 */
const getServiceRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('user', 'name roomNumber')
      .populate('booking', 'bookingCode')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { requests } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update service request status
 * @route   PUT /api/manager/service-requests/:id
 * @access  Private (Manager / Admin)
 */
const updateServiceRequest = async (req, res, next) => {
  try {
    const { status, assignedTo, notes } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, notes, resolvedAt: status === 'completed' ? new Date() : undefined },
      { new: true }
    );
    res.status(200).json({ success: true, data: { request } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getBookings,
  checkInBooking,
  checkOutBooking,
  assignRoomToBooking,
  getCategories,
  createCategory,
  updateCategory,
  getRooms,
  createRoom,
  updateRoom,
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  getStaffList,
  recordAttendance,
  getAttendanceList,
  getCleaningTasks,
  assignCleaning,
  completeCleaningTask,
  getInspections,
  submitInspectionResults,
  getMaintenanceIssues,
  createMaintenanceIssue,
  assignMaintenance,
  resolveMaintenance,
  verifyMaintenance,
  getReviews,
  replyToReview,
  getServiceRequests,
  updateServiceRequest,
};
