const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Room = require('../models/Room');
const RoomCategory = require('../models/RoomCategory');
const CleaningTask = require('../models/CleaningTask');
const MaintenanceIssue = require('../models/MaintenanceIssue');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { ROLES, BOOKING_STATUS } = require('../config/constants');

/**
 * @desc    Get Admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const utcStartOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const utcEndOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const minToday = startOfDay < utcStartOfDay ? startOfDay : utcStartOfDay;
    const maxToday = endOfDay > utcEndOfDay ? endOfDay : utcEndOfDay;

    // Basic stats
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Today's Bookings & Check-ins/outs
    const todayBookingsCount = await Booking.countDocuments({
      createdAt: { $gte: minToday, $lte: maxToday },
    });
    
    const todayCheckIns = await Booking.countDocuments({
      checkIn: { $gte: minToday, $lte: maxToday },
      status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING, BOOKING_STATUS.CHECKED_IN] },
    });

    const todayCheckOuts = await Booking.countDocuments({
      checkOut: { $gte: minToday, $lte: maxToday },
      status: { $in: [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CHECKED_OUT] },
    });
    
    // Revenue totals
    const payments = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = payments[0]?.total || 0;

    // Refund totals
    const refunds = await Refund.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRefunds = refunds[0]?.total || 0;

    // Rooms status distribution
    const roomsCount = await Room.countDocuments({ isActive: true });
    const availableRooms = await Room.countDocuments({ status: 'available', isActive: true });
    const bookedRooms = await Room.countDocuments({ status: 'booked', isActive: true });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied', isActive: true });
    
    // Open complaints
    const openComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'investigating', 'escalated'] } });

    // Recent activity log (Audit logs)
    const recentAuditLogs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers },
        bookings: {
          total: totalBookings,
          today: todayBookingsCount,
        },
        todayActivity: {
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
        },
        finance: {
          totalRevenue,
          totalRefunds,
          netRevenue: totalRevenue - totalRefunds,
        },
        rooms: {
          total: roomsCount,
          available: availableRooms,
          booked: bookedRooms,
          occupied: occupiedRooms,
        },
        complaints: { open: openComplaints },
        recentActivity: recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get users list for management
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
      ];
    }

    const users = await User.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
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
 * @desc    Create a user (Manager/Staff)
 * @route   POST /api/admin/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, staffType, phone } = req.body;
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      staffType,
      phone,
      isVerified: true,
    });

    res.status(201).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.status(200).json({ success: true, message: 'User deactivated successfully', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get finance reports (payments and refunds)
 * @route   GET /api/admin/finance
 * @access  Private (Admin)
 */
const getFinanceAnalytics = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('booking', 'bookingCode totalAmount')
      .sort({ createdAt: -1 })
      .limit(100);

    const refunds = await Refund.find()
      .populate('user', 'name email')
      .populate('booking', 'bookingCode')
      .sort({ createdAt: -1 })
      .limit(100);

    // Sum aggregate by payment method
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Monthly revenue aggregate for charts
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Summary totals
    const totalPayments = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalRefunds = await Refund.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        refunds,
        methodsBreakdown: revenueStats,
        monthlyRevenue,
        summary: {
          grossRevenue: totalPayments[0]?.total || 0,
          totalRefunds: totalRefunds[0]?.total || 0,
          netRevenue: (totalPayments[0]?.total || 0) - (totalRefunds[0]?.total || 0),
          successfulTransactionsCount: payments.filter((p) => p.status === 'successful').length,
          pendingRefundsCount: refunds.filter((r) => r.status === 'pending').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process or update refund status
 * @route   PUT /api/admin/refunds/:id
 * @access  Private (Admin)
 */
const updateRefundStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'processed' or 'rejected'
    const { processRefund } = require('../services/payment.service');

    if (!['processed', 'rejected', 'approved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid refund status' });
    }

    const refund = await processRefund(id, req.user._id, status);
    res.status(200).json({
      success: true,
      message: `Refund status updated to ${status}`,
      data: { refund },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        logs,
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
 * @desc    Get resort settings
 * @route   GET /api/admin/settings
 * @access  Private (Admin)
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update resort settings
 * @route   PUT /api/admin/settings
 * @access  Private (Admin)
 */
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // Array of key-value pairs
    const updated = [];
    for (const s of settings) {
      const doc = await Setting.findOneAndUpdate(
        { key: s.key },
        { value: s.value, updatedBy: req.user._id },
        { new: true, upsert: true }
      );
      updated.push(doc);
    }
    res.status(200).json({ success: true, data: { settings: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user complaints
 * @route   GET /api/admin/complaints
 * @access  Private (Admin)
 */
const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .populate('booking', 'bookingCode')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { complaints } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve complaint
 * @route   PUT /api/admin/complaints/:id
 * @access  Private (Admin)
 */
const resolveComplaint = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolution, resolvedAt: status === 'resolved' ? new Date() : undefined, assignedTo: req.user._id },
      { new: true }
    );
    res.status(200).json({ success: true, data: { complaint } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Broadcast system notification
 * @route   POST /api/admin/notifications
 * @access  Private (Admin)
 */
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, role } = req.body;
    
    // Find target users
    const query = {};
    if (role) query.role = role;
    const targetUsers = await User.find(query);

    const notificationDocs = targetUsers.map(u => ({
      user: u._id,
      title,
      message,
      type: 'system',
    }));

    await Notification.insertMany(notificationDocs);

    res.status(201).json({ success: true, message: `Notification broadcasted to ${targetUsers.length} users` });
  } catch (error) {
    next(error);
  }
};

const CATEGORY_FALLBACK_IMAGES = {
  'deluxe-room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'garden-cottage': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  'premium-suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'pool-villa': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
};

/**
 * @desc    Get all room categories / suites (Admin)
 * @route   GET /api/admin/categories
 * @access  Private (Admin)
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find().sort({ basePrice: 1 });
    const roomsCount = await Room.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    roomsCount.forEach((r) => {
      countMap[r._id.toString()] = r.count;
    });

    const enriched = categories.map((cat) => {
      const c = cat.toObject();
      c.totalRooms = countMap[cat._id.toString()] || 0;

      // Sanitize broken or missing image URLs
      if (!c.images || c.images.length === 0 || !c.images.some((img) => img.url && img.url.startsWith('http'))) {
        const fallbackUrl = CATEGORY_FALLBACK_IMAGES[cat.slug] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85';
        c.images = [{ url: fallbackUrl, alt: cat.name, isPrimary: true }];
        
        // Auto-heal MongoDB document
        RoomCategory.findByIdAndUpdate(cat._id, { images: c.images }).catch(() => {});
      }

      return c;
    });

    res.status(200).json({ success: true, data: { categories: enriched } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a room category / suite (Admin)
 * @route   POST /api/admin/categories
 * @access  Private (Admin)
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
 * @desc    Update a room category / suite (Admin)
 * @route   PUT /api/admin/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Room category not found' });
    }
    res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room category / suite (Admin)
 * @route   DELETE /api/admin/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const roomsUsingCat = await Room.countDocuments({ category: req.params.id });
    if (roomsUsingCat > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${roomsUsingCat} physical room units are currently assigned to it. Reassign or delete those rooms first.`,
      });
    }
    const category = await RoomCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Room category not found' });
    }
    res.status(200).json({ success: true, message: 'Suite category removed successfully', data: { category } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all physical rooms (Admin)
 * @route   GET /api/admin/rooms
 * @access  Private (Admin)
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
 * @desc    Create physical room (Admin)
 * @route   POST /api/admin/rooms
 * @access  Private (Admin)
 */
const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    const populated = await Room.findById(room._id).populate('category');
    res.status(201).json({ success: true, data: { room: populated } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update physical room (Admin)
 * @route   PUT /api/admin/rooms/:id
 * @access  Private (Admin)
 */
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room unit not found' });
    }
    res.status(200).json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete physical room (Admin)
 * @route   DELETE /api/admin/rooms/:id
 * @access  Private (Admin)
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room unit not found' });
    }
    res.status(200).json({ success: true, message: 'Physical room deleted successfully', data: { room } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
  getFinanceAnalytics,
  updateRefundStatus,
  getAuditLogs,
  getSettings,
  updateSettings,
  getComplaints,
  resolveComplaint,
  broadcastNotification,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
