import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  IoPersonOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoMailOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './AuthPages.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    age: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const { phoneRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    if (!form.address.trim()) {
      toast.error('Please enter your city / address');
      return;
    }
    if (!form.age) {
      toast.error('Please enter your age');
      return;
    }

    setLoading(true);
    try {
      const user = await phoneRegister(form);
      toast.success(`Welcome to AJIIS Resort, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="auth-tag">JOIN THE SANCTUARY</span>
          <h1 className="auth-left-title font-display">Begin Your Journey</h1>
          <p className="auth-left-text">
            Register your guest profile to enjoy direct reservation benefits, customized stays, and exclusive wellness retreats.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-text font-display">AJIIS RESORT</span>
          </Link>
          <h2 className="auth-title font-serif">Create Guest Profile</h2>
          <p className="auth-subtitle">Please enter your basic information to complete registration</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Elena Rostova"
              icon={<IoPersonOutline />}
              required
              autoFocus
            />

            <Input
              label="Contact / Mobile Number"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              icon={<IoCallOutline />}
              required
            />

            <div className="auth-grid-2">
              <Input
                label="Address / City"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. City, etc."
                icon={<IoLocationOutline />}
                required
              />

              <Input
                label="Age"
                type="number"
                name="age"
                min="1"
                max="120"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 30"
                icon={<IoCalendarOutline />}
                required
              />
            </div>

            <Input
              label="Email Address (Optional)"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="For booking confirmations"
              icon={<IoMailOutline />}
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              <span>Register & Sign In</span>
              <IoArrowForwardOutline />
            </Button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In with Mobile</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
