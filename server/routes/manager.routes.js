const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLog');
const ctrl = require('../controllers/manager.controller');

// Secure all manager routes - requires authentication and manager/admin role
router.use(protect);
router.use(authorize('manager', 'admin'));

// Dashboard
router.get('/dashboard', ctrl.getDashboardStats);

// Bookings & Guest Actions
router.get('/bookings', ctrl.getBookings);
router.post('/bookings/:id/checkin', auditLog('checkin', 'Booking'), ctrl.checkInBooking);
router.post('/bookings/:id/checkout', auditLog('checkout', 'Booking'), ctrl.checkOutBooking);
router.post('/bookings/:id/assign-room', auditLog('assign_room', 'Booking'), ctrl.assignRoomToBooking);

// Room Categories (Read-only for Manager, configured by Admin)
router.get('/categories', ctrl.getCategories);

// Physical Rooms Management (Manager assigns numbers and manages units)
router.get('/rooms', ctrl.getRooms);
router.post('/rooms', auditLog('create', 'Room'), ctrl.createRoom);
router.put('/rooms/:id', auditLog('update', 'Room'), ctrl.updateRoom);

// Dynamic Pricing Management
router.get('/pricing', ctrl.getPricingRules);
router.post('/pricing', auditLog('create', 'RoomPrice'), ctrl.createPricingRule);
router.put('/pricing/:id', auditLog('update', 'RoomPrice'), ctrl.updatePricingRule);
router.delete('/pricing/:id', auditLog('delete', 'RoomPrice'), ctrl.deletePricingRule);

// Staff & Attendance
router.get('/staff', ctrl.getStaffList);
router.get('/attendance', ctrl.getAttendanceList);
router.post('/attendance', auditLog('update', 'StaffAttendance'), ctrl.recordAttendance);

// Cleaning tasks
router.get('/cleaning', ctrl.getCleaningTasks);
router.post('/cleaning/:id/assign', auditLog('assign', 'CleaningTask'), ctrl.assignCleaning);
router.post('/cleaning/:id/complete', auditLog('complete', 'CleaningTask'), ctrl.completeCleaningTask);

// Inspections
router.get('/inspections', ctrl.getInspections);
router.post('/inspections/:id/submit', auditLog('submit', 'Inspection'), ctrl.submitInspectionResults);

// Maintenance
router.get('/maintenance', ctrl.getMaintenanceIssues);
router.post('/maintenance', auditLog('create', 'MaintenanceIssue'), ctrl.createMaintenanceIssue);
router.post('/maintenance/:id/assign', auditLog('assign', 'MaintenanceIssue'), ctrl.assignMaintenance);
router.post('/maintenance/:id/resolve', auditLog('resolve', 'MaintenanceIssue'), ctrl.resolveMaintenance);
router.post('/maintenance/:id/verify', auditLog('verify', 'MaintenanceIssue'), ctrl.verifyMaintenance);

// Guest Reviews
router.get('/reviews', ctrl.getReviews);
router.post('/reviews/:id/reply', auditLog('reply', 'Review'), ctrl.replyToReview);

// Service Requests
router.get('/service-requests', ctrl.getServiceRequests);
router.put('/service-requests/:id', auditLog('update', 'ServiceRequest'), ctrl.updateServiceRequest);

module.exports = router;
