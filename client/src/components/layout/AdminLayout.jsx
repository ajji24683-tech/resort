import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  IoGridOutline,
  IoBedOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoNotificationsOutline,
} from 'react-icons/io5';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin', label: 'Dashboard Control', icon: <IoGridOutline /> },
    { path: '/admin/rooms', label: 'Suites & Pricing', icon: <IoBedOutline /> },
    { path: '/admin/users', label: 'User Accounts', icon: <IoPeopleOutline /> },
    { path: '/admin/finance', label: 'Finance Analytics', icon: <IoCashOutline /> },
    { path: '/admin/audit-logs', label: 'System Audit Logs', icon: <IoDocumentTextOutline /> },
    { path: '/admin/settings', label: 'System Settings', icon: <IoSettingsOutline /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">👑</span>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="brand-title font-display">AJIIS</span>
              <span className="brand-subtitle">CONTROL CENTER</span>
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
      <div className="admin-main-container">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h2 className="topbar-title font-heading">
              {menuItems.find((item) => item.path === location.pathname)?.label || 'System Administrator'}
            </h2>
          </div>
          <div className="topbar-right">
            <button className="topbar-action-btn" title="System Warnings">
              <IoNotificationsOutline />
            </button>
            <div className="topbar-user">
              <div className="user-avatar">A</div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">System Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
