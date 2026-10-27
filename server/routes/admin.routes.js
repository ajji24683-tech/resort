const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLog');
const ctrl = require('../controllers/admin.controller');

// Secure all admin routes - requires authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', ctrl.getAdminDashboardStats);

// User Management (Managers, Staff, Customers)
router.get('/users', ctrl.getUsers);
router.post('/users', auditLog('create', 'User'), ctrl.createUser);
router.put('/users/:id', auditLog('update', 'User'), ctrl.updateUser);
router.delete('/users/:id', auditLog('deactivate', 'User'), ctrl.deactivateUser);

// Suite Categories & Pricing Management
router.get('/categories', ctrl.getCategories);
router.post('/categories', auditLog('create', 'RoomCategory'), ctrl.createCategory);
router.put('/categories/:id', auditLog('update', 'RoomCategory'), ctrl.updateCategory);
router.delete('/categories/:id', auditLog('delete', 'RoomCategory'), ctrl.deleteCategory);

// Physical Rooms Management
router.get('/rooms', ctrl.getRooms);
router.post('/rooms', auditLog('create', 'Room'), ctrl.createRoom);
router.put('/rooms/:id', auditLog('update', 'Room'), ctrl.updateRoom);
router.delete('/rooms/:id', auditLog('delete', 'Room'), ctrl.deleteRoom);

// Finance & Revenue Analytics
router.get('/finance', ctrl.getFinanceAnalytics);
router.put('/refunds/:id', auditLog('process', 'Refund'), ctrl.updateRefundStatus);

// Audit Logs
router.get('/audit-logs', ctrl.getAuditLogs);

// System Settings Configuration
router.get('/settings', ctrl.getSettings);
router.put('/settings', auditLog('update', 'Setting'), ctrl.updateSettings);

// Complaint Management
router.get('/complaints', ctrl.getComplaints);
router.put('/complaints/:id', auditLog('resolve', 'Complaint'), ctrl.resolveComplaint);

// Notifications Broadcast
router.post('/notifications', auditLog('broadcast', 'Notification'), ctrl.broadcastNotification);

module.exports = router;
