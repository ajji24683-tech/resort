import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoPersonOutline, IoKeyOutline, IoMailOutline, IoCallOutline, IoLocationOutline } from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // Profile update form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    idType: user?.idType || '',
    idNumber: user?.idNumber || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password update form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.data.user);
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container-sm">
        <h1 className="profile-title font-display">My Sanctuary Profile</h1>
        <p className="profile-subtitle">Manage your personal settings, contact information, and security preferences.</p>

        <div className="profile-layouts">
          {/* Profile Form */}
          <div className="profile-card glass animate-fade-in-up">
            <h2 className="profile-section-heading font-heading">
              <IoPersonOutline /> Contact Settings
            </h2>
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <Input
                label="Full Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
              />
              <div className="input-group">
                <label className="input-label">Email Address (Read-only)</label>
                <div className="input-wrapper">
                  <span className="input-icon"><IoMailOutline /></span>
                  <input className="input-field" value={user?.email} disabled />
                </div>
              </div>
              <Input
                label="Phone Number"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                icon={<IoCallOutline />}
              />
              <Input
                label="Address / City"
                name="address"
                value={profileForm.address}
                onChange={handleProfileChange}
                placeholder="e.g. City, etc."
                icon={<IoLocationOutline />}
              />
              
              <div className="profile-id-row">
                <div className="input-group">
                  <label className="input-label">Default Identity Document Type</label>
                  <select
                    className="input-field"
                    name="idType"
                    value={profileForm.idType}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select ID type</option>
                    <option value="aadhar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="national_id">Voter ID / National ID</option>
                    <option value="driving_license">Driving License</option>
                  </select>
                </div>
                <Input
                  label="ID Number"
                  name="idNumber"
                  value={profileForm.idNumber}
                  onChange={handleProfileChange}
                  placeholder="ID Number"
                />
              </div>

              <Button type="submit" variant="primary" loading={profileLoading}>
                Save Contact Info
              </Button>
            </form>
          </div>

          {/* Password Form */}
          <div className="profile-card glass animate-fade-in-up stagger-1">
            <h2 className="profile-section-heading font-heading">
              <IoKeyOutline /> Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <Input
                type="password"
                label="Current Password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              <Input
                type="password"
                label="New Password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Min 6 characters"
                required
              />
              <Input
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Re-enter new password"
                required
              />
              <Button type="submit" variant="accent" loading={passwordLoading}>
                Change Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
