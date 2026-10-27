import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import '../customer/AuthPages.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        logout();
        toast.error('Access restricted: Administrator credentials required.');
        return;
      }
      toast.success(`Welcome, Administrator ${user.name}`);
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth-page">
      {/* Left Editorial Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="auth-tag">SYSTEM SECURITY</span>
          <h1 className="auth-left-title font-display">Administrative Console</h1>
          <p className="auth-left-text">
            Centralized security controls, financial auditing, property configuration, and system oversight for Ajiis Resort.
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="admin-portal-header">
            <span className="auth-logo-text font-display">AJIIS RESORT</span>
            <div className="admin-security-badge">
              <IoShieldCheckmarkOutline />
              <span>Admin Portal</span>
            </div>
          </div>

          <h2 className="auth-title font-serif">Administrator Sign In</h2>
          <p className="auth-subtitle">
            Restricted access. Please provide your verified administrative credentials.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Admin Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ajiisresort.com"
              icon={<IoMailOutline />}
              required
              autoFocus
            />

            <Input
              label="Security Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              icon={<IoLockClosedOutline />}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              <span>Authenticate & Enter</span>
              <IoArrowForwardOutline />
            </Button>
          </form>

          <div className="auth-demo-credentials">
            <p className="demo-title">Default Admin Credentials</p>
            <div className="demo-list">
              <span><strong>Email:</strong> admin@yashiiiresort.com</span>
              <span><strong>Password:</strong> admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
