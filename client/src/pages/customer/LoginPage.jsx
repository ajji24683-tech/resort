import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  IoCallOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoMailOutline,
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './AuthPages.css';

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 India (+91)', short: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 USA (+1)', short: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 UK (+44)', short: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 UAE (+971)', short: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 Singapore (+65)', short: '🇸🇬 +65' },
  { code: '+61', label: '🇦🇺 Australia (+61)', short: '🇦🇺 +61' },
  { code: '+49', label: '🇩🇪 Germany (+49)', short: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 France (+33)', short: '🇫🇷 +33' },
  { code: '+81', label: '🇯🇵 Japan (+81)', short: '🇯🇵 +81' },
  { code: '+86', label: '🇨🇳 China (+86)', short: '🇨🇳 +86' },
];

const LoginPage = () => {
  // Step modes: 'phone_input' | 'existing_user' | 'new_user_signup'
  const [step, setStep] = useState('phone_input');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const [password, setPassword] = useState('');
  
  // Registration form fields
  const [regForm, setRegForm] = useState({
    name: '',
    address: '',
    age: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const { checkPhone, phoneLogin, phoneRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';
  const fullPhone = `${countryCode}${phone}`;

  // Step 1: Check if mobile number is already signed up
  const handleCheckPhone = async (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 6) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await checkPhone(fullPhone);
      if (res.exists) {
        setExistingUser(res.user);
        setStep('existing_user');
      } else {
        setStep('new_user_signup');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not verify mobile number');
    } finally {
      setLoading(false);
    }
  };

  // Step 2A: Existing customer login
  const handlePhoneLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const user = await phoneLogin({ phone: fullPhone, password });
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
      else navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2B: New customer registration (Name, Address / City, Age, Contact, Email)
  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!regForm.address.trim()) {
      toast.error('Please enter your city / address');
      return;
    }
    if (!regForm.age || parseInt(regForm.age, 10) < 1) {
      toast.error('Please enter a valid age');
      return;
    }

    setLoading(true);
    try {
      const user = await phoneRegister({
        phone: fullPhone,
        name: regForm.name,
        address: regForm.address,
        age: regForm.age,
        email: regForm.email,
        password: regForm.password,
      });
      toast.success(`Welcome to AJIIS Resort, ${user.name}!`);
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-page">
      {/* Left Editorial Branding Showcase */}
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="auth-tag">GUEST SANCTUARY</span>
          <h1 className="auth-left-title font-display">Your Sanctuary Awaits</h1>
          <p className="auth-left-text">
            Experience unhurried luxury, bespoke hillside suites, and timeless moments tailored to your rhythm.
          </p>
        </div>
      </div>

      {/* Right Dynamic Customer Authentication Flow */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-text font-display">AJIIS RESORT</span>
          </Link>

          {/* ═════════════════════════════════════════════════════════════
              STEP 1: Enter Mobile Number
             ═════════════════════════════════════════════════════════════ */}
          {step === 'phone_input' && (
            <div className="auth-flow-step animate-fade-in">
              <h2 className="auth-title font-serif">Guest Sign In</h2>
              <p className="auth-subtitle">
                Enter your mobile number to sign in or create your guest account.
              </p>

              <form onSubmit={handleCheckPhone} className="auth-form">
                <div className="phone-input-group">
                  <label className="phone-input-label">Mobile Number</label>
                  <div className="phone-input-row">
                    <div className="country-code-select">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="country-code-dropdown"
                      >
                        {COUNTRY_CODES.map((cc) => (
                          <option key={cc.code} value={cc.code}>
                            {cc.short}
                          </option>
                        ))}
                      </select>
                      <IoChevronDownOutline className="country-code-chevron" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="98765 43210"
                      className="phone-number-input"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  <span>Continue</span>
                  <IoArrowForwardOutline />
                </Button>
              </form>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STEP 2A: Existing User Found (Sign In)
             ═════════════════════════════════════════════════════════════ */}
          {step === 'existing_user' && (
            <div className="auth-flow-step animate-fade-in">
              <div className="user-welcome-card">
                <div className="welcome-avatar">
                  {existingUser?.name?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div className="welcome-info">
                  <span className="welcome-tag">WELCOME BACK</span>
                  <h3 className="welcome-name font-serif">{existingUser?.name}</h3>
                  <span className="welcome-phone">{fullPhone}</span>
                </div>
              </div>

              <p className="auth-subtitle">
                We found your Ajiis guest account. Click below to continue your journey.
              </p>

              <form onSubmit={handlePhoneLogin} className="auth-form">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  onClick={handlePhoneLogin}
                >
                  <IoCheckmarkCircleOutline />
                  <span>Sign In as {existingUser?.name?.split(' ')[0]}</span>
                </Button>

                <button
                  type="button"
                  className="btn-back-step"
                  onClick={() => {
                    setStep('phone_input');
                    setPassword('');
                  }}
                >
                  <IoArrowBackOutline />
                  <span>Use a different mobile number</span>
                </button>
              </form>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STEP 2B: New User Registration (Name, Address / City, Age, Phone)
             ═════════════════════════════════════════════════════════════ */}
          {step === 'new_user_signup' && (
            <div className="auth-flow-step animate-fade-in">
              <h2 className="auth-title font-serif">Create Guest Profile</h2>
              <p className="auth-subtitle">
                New to Ajiis Resort? Please fill in your details to complete your registration.
              </p>

              <form onSubmit={handlePhoneRegister} className="auth-form">
                {/* Full Name */}
                <Input
                  label="Full Name"
                  name="name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  icon={<IoPersonOutline />}
                  required
                  autoFocus
                />

                {/* Mobile Number (Prefilled) */}
                <Input
                  label="Mobile Number"
                  type="tel"
                  name="phone"
                  value={fullPhone}
                  readOnly
                  icon={<IoCallOutline />}
                  required
                />

                {/* Address / City & Age Grid */}
                <div className="auth-grid-2">
                  <Input
                    label="Address / City"
                    name="address"
                    value={regForm.address}
                    onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
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
                    value={regForm.age}
                    onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                    placeholder="e.g. 32"
                    icon={<IoCalendarOutline />}
                    required
                  />
                </div>

                {/* Email (Optional for Booking Receipts) */}
                <Input
                  label="Email Address (Optional)"
                  type="email"
                  name="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="For invoices & confirmation"
                  icon={<IoMailOutline />}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  <span>Complete Profile & Sign In</span>
                  <IoArrowForwardOutline />
                </Button>

                <button
                  type="button"
                  className="btn-back-step"
                  onClick={() => setStep('phone_input')}
                >
                  <IoArrowBackOutline />
                  <span>Change mobile number</span>
                </button>
              </form>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default LoginPage;
