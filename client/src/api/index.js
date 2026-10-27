import api from './axios';

export const authAPI = {
  checkPhone: (data) => api.post('/auth/phone-check', data),
  phoneLogin: (data) => api.post('/auth/phone-login', data),
  phoneRegister: (data) => api.post('/auth/phone-register', data),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const roomsAPI = {
  getCategories: () => api.get('/rooms/categories'),
  getCategoryDetail: (id) => api.get(`/rooms/categories/${id}`),
  searchRooms: (params) => api.get('/rooms/search', { params }),
  getReviews: (params) => api.get('/rooms/reviews', { params }),
  getRoomDetail: (id) => api.get(`/rooms/${id}`),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getDetail: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  addGuests: (id, data) => api.post(`/bookings/${id}/guests`, data),
  submitReview: (id, data) => api.post(`/bookings/${id}/review`, data),
};

export const paymentsAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
  getStatus: (id) => api.get(`/payments/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const managerAPI = {
  getDashboard: () => api.get('/manager/dashboard'),
  // Bookings
  getBookings: (params) => api.get('/manager/bookings', { params }),
  checkIn: (id) => api.post(`/manager/bookings/${id}/checkin`),
  checkOut: (id) => api.post(`/manager/bookings/${id}/checkout`),
  assignRoom: (id, roomId) => api.post(`/manager/bookings/${id}/assign-room`, { roomId }),
  // Rooms & Categories (Categories configured by Admin)
  getRooms: () => api.get('/manager/rooms'),
  createRoom: (data) => api.post('/manager/rooms', data),
  updateRoom: (id, data) => api.put(`/manager/rooms/${id}`, data),
  getCategories: () => api.get('/manager/categories'),
  createCategory: (data) => api.post('/manager/categories', data),
  updateCategory: (id, data) => api.put(`/manager/categories/${id}`, data),
  // Pricing
  getPricing: () => api.get('/manager/pricing'),
  createPricing: (data) => api.post('/manager/pricing', data),
  updatePricing: (id, data) => api.put(`/manager/pricing/${id}`, data),
  deletePricing: (id) => api.delete(`/manager/pricing/${id}`),
  // Staff & Attendance
  getStaff: () => api.get('/manager/staff'),
  getAttendance: (params) => api.get('/manager/attendance', { params }),
  recordAttendance: (data) => api.post('/manager/attendance', data),
  // Cleaning & Inspection
  getCleaningTasks: () => api.get('/manager/cleaning'),
  assignCleaning: (id, staffId) => api.post(`/manager/cleaning/${id}/assign`, { staffId }),
  completeCleaning: (id, data) => api.post(`/manager/cleaning/${id}/complete`, data),
  getInspections: () => api.get('/manager/inspections'),
  submitInspection: (id, data) => api.post(`/manager/inspections/${id}/submit`, data),
  // Maintenance
  getMaintenance: () => api.get('/manager/maintenance'),
  createMaintenance: (data) => api.post('/manager/maintenance', data),
  assignMaintenance: (id, staffId) => api.post(`/manager/maintenance/${id}/assign`, { staffId }),
  resolveMaintenance: (id, data) => api.post(`/manager/maintenance/${id}/resolve`, data),
  verifyMaintenance: (id) => api.post(`/manager/maintenance/${id}/verify`),
  // Reviews & Service Requests
  getReviews: () => api.get('/manager/reviews'),
  replyToReview: (id, reply) => api.post(`/manager/reviews/${id}/reply`, { reply }),
  getServiceRequests: () => api.get('/manager/service-requests'),
  updateServiceRequest: (id, data) => api.put(`/manager/service-requests/${id}`, data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Suite Categories & Pricing
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Physical Rooms
  getRooms: () => api.get('/admin/rooms'),
  createRoom: (data) => api.post('/admin/rooms', data),
  updateRoom: (id, data) => api.put(`/admin/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/admin/rooms/${id}`),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}`),
  // Finance
  getFinance: () => api.get('/admin/finance'),
  updateRefundStatus: (id, status) => api.put(`/admin/refunds/${id}`, { status }),
  // Audit Logs
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  // Complaints
  getComplaints: () => api.get('/admin/complaints'),
  resolveComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),
  // Notifications
  broadcastNotification: (data) => api.post('/admin/notifications', data),
};
