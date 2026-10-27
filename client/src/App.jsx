import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import RoomsPage from './pages/customer/RoomsPage';
import RoomDetailPage from './pages/customer/RoomDetailPage';
import SearchResultsPage from './pages/customer/SearchResultsPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import BookingPage from './pages/customer/BookingPage';
import PaymentPage from './pages/customer/PaymentPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BookingDetailPage from './pages/customer/BookingDetailPage';
import ProfilePage from './pages/customer/ProfilePage';
import NotificationsPage from './pages/customer/NotificationsPage';

// Manager Layout & Pages
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManageBookings from './pages/manager/ManageBookings';
import ManageRooms from './pages/manager/ManageRooms';
import CleaningTasks from './pages/manager/CleaningTasks';
import Inspections from './pages/manager/Inspections';
import MaintenanceBoard from './pages/manager/MaintenanceBoard';
import ManagerLoginPage from './pages/manager/ManagerLoginPage';

// Admin Layout & Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomManagement from './pages/admin/RoomManagement';
import UserManagement from './pages/admin/UserManagement';
import FinanceAuditing from './pages/admin/FinanceAuditing';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import AdminLoginPage from './pages/admin/AdminLoginPage';
const ManagerDashboardPlaceholder = () => (
  <div style={{ padding: '120px 20px', textAlign: 'center' }}>
    <h1 className="font-display">Manager Dashboard</h1>
    <p style={{ color: 'var(--color-gray-500)', marginTop: '10px' }}>
      Operations dashboard (Phase 2 implementation underway).
    </p>
  </div>
);

// Admin Dashboard Placeholder
const AdminDashboardPlaceholder = () => (
  <div style={{ padding: '120px 20px', textAlign: 'center' }}>
    <h1 className="font-display">Admin Dashboard</h1>
    <p style={{ color: 'var(--color-gray-500)', marginTop: '10px' }}>
      System control center (Phase 3 implementation underway).
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-white)',
              color: 'var(--color-gray-800)',
              fontFamily: 'var(--font-heading)',
              fontWeight: '500',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
            },
          }}
        />
        <Routes>
          {/* Customer / Public Routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="rooms/:id" element={<RoomDetailPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            
            {/* Auth routes under customer layout */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected Customer Routes */}
            <Route
              path="book/:roomId"
              element={
                <ProtectedRoute roles={['customer', 'manager', 'admin']}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment/:bookingId"
              element={
                <ProtectedRoute roles={['customer', 'manager', 'admin']}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-bookings"
              element={
                <ProtectedRoute roles={['customer', 'manager', 'admin']}>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-bookings/:id"
              element={
                <ProtectedRoute roles={['customer', 'manager', 'admin']}>
                  <BookingDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute roles={['customer', 'manager', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute roles={['customer', 'manager', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Standalone Manager & Admin Auth Portals (Direct URL access only) */}
          <Route path="/manager/login" element={<ManagerLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Manager Role Protected Routes (Phase 2) */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="pricing" element={<div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}><h3>Dynamic Seasonal Pricing Rules</h3><p style={{ marginTop: '10px', color: 'var(--color-gray-500)' }}>Automated seasonal rates and weekend surcharges engine dashboard.</p></div>} />
            <Route path="cleaning" element={<CleaningTasks />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="maintenance" element={<MaintenanceBoard />} />
            <Route path="staff" element={<div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}><h3>Staff Registry & Rostering</h3><p style={{ marginTop: '10px', color: 'var(--color-gray-500)' }}>Manage resort operations team and track housekeeper/technician dispatch metrics.</p></div>} />
          </Route>

          {/* Admin Role Protected Routes (Phase 3) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="finance" element={<FinanceAuditing />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
