import React, { useState } from 'react';
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCog
} from 'react-icons/fa';
import './Settings.css';

function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Hussain Warraich',
    email: user?.email || 'hussain@example.com',
    phone: '',
    department: user?.department || 'Computer Science'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSaveProfile = () => {
    alert('Profile saved successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1><FaCog /> Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'profile' && (
            <div className="card">
              <h2><FaUser /> Profile Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSaveProfile}>
                <FaSave /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h2><FaLock /> Change Password</h2>
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
              </div>
              <button className="btn btn-primary" onClick={handleChangePassword}>
                <FaLock /> Update Password
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2><FaBell /> Notification Preferences</h2>
              <div className="notification-options">
                <div className="notification-item">
                  <div>
                    <h4>Email Notifications</h4>
                    <p>Receive attendance updates via email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div>
                    <h4>Push Notifications</h4>
                    <p>Get browser push notifications</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-item">
                  <div>
                    <h4>Attendance Alerts</h4>
                    <p>Alert when attendance drops below threshold</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.attendanceAlerts}
                      onChange={() => handleNotificationChange('attendanceAlerts')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
