import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  IoCloseOutline,
  IoCallOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoCalendarOutline,
  IoGridOutline,
} from 'react-icons/io5';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isManager } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isManager) return '/manager';
    return null;
  };

  const handleNavClick = (anchorId) => {
    setMenuOpen(false);
    if (isHome) {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${anchorId}`);
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled || !isHome ? 'navbar-scrolled' : 'navbar-transparent'}`}>
        <div className="navbar-container">
          {/* Left: Clean Hamburger Button */}
          <div className="navbar-left">
            <button
              type="button"
              className="navbar-hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open Navigation Menu"
            >
              <div className="hamburger-bars">
                <span className="bar" />
                <span className="bar" />
                <span className="bar" />
              </div>
            </button>
          </div>

          {/* Center: Brand Monogram / Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-title">AJIIS</span>
            <span className="logo-subtitle">SUITES & RESIDENCE</span>
          </Link>

          {/* Right: Contact & Book Now Button */}
          <div className="navbar-actions">
            <a
              href="tel:+914711550970"
              className="nav-icon-link"
              title="Call Concierge: +91 471 155 0970"
              aria-label="Call Concierge"
            >
              <IoCallOutline />
              <span className="nav-contact-label">Contact</span>
            </a>

            {/* Prominent Book Now CTA */}
            <Link to="/search" className="nav-btn-book-now font-sub">
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Full-screen / Side Overlay Navigation Drawer */}
      {menuOpen && (
        <div className="lingers-menu-overlay animate-fade-in">
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="menu-drawer">
            <div className="menu-drawer-header">
              <Link to="/" className="menu-drawer-logo" onClick={() => setMenuOpen(false)}>
                <span className="logo-title">AJIIS</span>
                <span className="logo-subtitle">SUITES & RESIDENCE</span>
              </Link>
              <button
                type="button"
                className="menu-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <IoCloseOutline />
              </button>
            </div>

            {/* Drawer Navigation Links without numbering */}
            <div className="menu-nav-links">
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <button type="button" onClick={() => handleNavClick('sanctuary')} className="drawer-link-btn">
                The Sanctuary & Philosophy
              </button>
              <button type="button" onClick={() => handleNavClick('suites')} className="drawer-link-btn">
                Suites & Private Villas
              </button>
              <button type="button" onClick={() => handleNavClick('experiences')} className="drawer-link-btn">
                Wellness & Experiences
              </button>
              <button type="button" onClick={() => handleNavClick('testimonials')} className="drawer-link-btn">
                Guest Impressions
              </button>
              <button type="button" onClick={() => handleNavClick('contact')} className="drawer-link-btn">
                Location & Arrival
              </button>
              <Link to="/search" onClick={() => setMenuOpen(false)} className="drawer-reserve-highlight font-serif">
                Reserve Your Stay →
              </Link>
            </div>

            {/* Drawer User Profile Section */}
            <div className="menu-drawer-footer">
              {isAuthenticated ? (
                <div className="drawer-user-profile">
                  <div className="drawer-profile-card">
                    <div className="drawer-avatar">
                      {user?.name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                    <div className="drawer-profile-info">
                      <span className="drawer-user-tag">
                        {user?.role === 'admin' ? 'ADMINISTRATOR' : user?.role === 'manager' ? 'MANAGEMENT' : 'GUEST SANCTUARY'}
                      </span>
                      <h4 className="drawer-user-name font-serif">{user?.name}</h4>
                      <span className="drawer-user-email">{user?.email || user?.phone}</span>
                    </div>
                  </div>

                  <div className="drawer-profile-links">
                    {getDashboardLink() && (
                      <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="drawer-profile-link-item">
                        <IoGridOutline /> Dashboard
                      </Link>
                    )}
                    <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="drawer-profile-link-item">
                      <IoCalendarOutline /> My Bookings
                    </Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="drawer-profile-link-item">
                      <IoPersonOutline /> Profile & Settings
                    </Link>
                    <button type="button" onClick={handleLogout} className="drawer-profile-link-item drawer-logout-item">
                      <IoLogOutOutline /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="menu-auth-group">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="menu-login-btn">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="menu-register-btn">
                    Create Account
                  </Link>
                </div>
              )}

              <div className="menu-contact-info">
                <p>Ajiis Hill Estate, Mountain Valley Road, Kerala</p>
                <p>+91 471 155 0970 • concierge@ajiisresort.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

