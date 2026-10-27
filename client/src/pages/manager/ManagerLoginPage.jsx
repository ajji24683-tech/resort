import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoBriefcaseOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import '../customer/AuthPages.css';

const ManagerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/manager';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'manager' && user.role !== 'admin') {
        logout();
        toast.error('Access restricted: Operations manager credentials required.');
        return;
      }
      toast.success(`Welcome back, Manager ${user.name}`);
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid manager credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page manager-auth-page">
      {/* Left Editorial Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="auth-tag">OPERATIONS DESK</span>
          <h1 className="auth-left-title font-display">Duty Manager Portal</h1>
          <p className="auth-left-text">
            Guest arrivals, room allocation, housekeeping task dispatch, and maintenance workflows for Ajiis Resort.
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="admin-portal-header">
            <span className="auth-logo-text font-display">AJIIS RESORT</span>
            <div className="admin-security-badge manager-badge">
              <IoBriefcaseOutline />
              <span>Operations Portal</span>
            </div>
          </div>

          <h2 className="auth-title font-serif">Manager Sign In</h2>
          <p className="auth-subtitle">
            Restricted access. Duty managers and operations supervisors only.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Staff Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@ajiisresort.com"
              icon={<IoMailOutline />}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<IoLockClosedOutline />}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              <span>Sign In to Operations</span>
              <IoArrowForwardOutline />
            </Button>
          </form>

          <div className="auth-demo-credentials">
            <p className="demo-title">Default Manager Credentials</p>
            <div className="demo-list">
              <span><strong>Email:</strong> manager@yashiiiresort.com</span>
              <span><strong>Password:</strong> manager123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;
