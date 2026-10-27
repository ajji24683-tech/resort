import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  IoGridOutline,
  IoCalendarOutline,
  IoBedOutline,
  IoBrushOutline,
  IoShieldCheckmarkOutline,
  IoHammerOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoNotificationsOutline,
  IoLockOpenOutline,
} from 'react-icons/io5';
import './ManagerLayout.css';

const ManagerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/manager', label: 'Operations Overview', icon: <IoGridOutline /> },
    { path: '/manager/bookings', label: 'Guest Bookings', icon: <IoCalendarOutline /> },
    { path: '/manager/rooms', label: 'Rooms & Categories', icon: <IoBedOutline /> },
    { path: '/manager/pricing', label: 'Seasonal pricing', icon: <IoStatsChartOutline /> },
    { path: '/manager/cleaning', label: 'Housekeeping', icon: <IoBrushOutline /> },
    { path: '/manager/inspections', label: 'Inspections Queue', icon: <IoShieldCheckmarkOutline /> },
    { path: '/manager/maintenance', label: 'Maintenance board', icon: <IoHammerOutline /> },
    { path: '/manager/staff', label: 'Staff registry', icon: <IoPeopleOutline /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`manager-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="manager-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">🏨</span>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="brand-title font-display">AJIIS</span>
              <span className="brand-subtitle">OPERATIONS</span>
            </div>
          )}
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <IoChevronForwardOutline /> : <IoChevronBackOutline />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="link-icon">{item.icon}</span>
                    {!collapsed && <span className="link-label">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span className="link-icon"><IoLogOutOutline /></span>
            {!collapsed && <span className="link-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="manager-main-container">
        {/* Topbar */}
        <header className="manager-topbar">
          <div className="topbar-left">
            <h2 className="topbar-title font-heading">
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Operations Manager'}
            </h2>
          </div>
          <div className="topbar-right">
            <button className="topbar-action-btn" title="Alerts & Notifications">
              <IoNotificationsOutline />
            </button>
            <div className="topbar-user">
              <div className="user-avatar">M</div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">Resort Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering */}
        <main className="manager-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
