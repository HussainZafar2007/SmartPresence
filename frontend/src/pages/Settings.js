import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaCamera, 
  FaSave, 
  FaUndo, 
  FaEye, 
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaShieldAlt,
  FaPalette,
  FaDesktop,
  FaMobileAlt,
  FaDatabase,
  FaSync,
  FaTrash,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaUniversity,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';

function Settings({ user }) {
  // User Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || 'Computer Science',
    semester: user?.semester || '4',
    studentId: user?.studentId || '2024-cs-472'
  });

  // Account Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true,
    lowAttendanceAlerts: true,
    reportAlerts: false,
    systemUpdates: true
  });

  // Face Recognition Settings
  const [faceSettings, setFaceSettings] = useState({
    autoCapture: true,
    enableSound: true,
    flashEffect: false,
    detectionSensitivity: 75,
    maxRetryAttempts: 3,
    saveFaceImages: false
  });

  // System Preferences
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC+5',
    dateFormat: 'MM/DD/YYYY',
    autoLogout: 30,
    dataSavingMode: false,
    highContrast: false
  });

  // UI State
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // Departments list
  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration'
  ];

  // Semesters list
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Themes list
  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '⚙️' },
    { value: 'blue', label: 'Blue', icon: '🔵' },
    { value: 'green', label: 'Green', icon: '🟢' }
  ];

  // Languages list
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ur', label: 'Urdu' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'ar', label: 'Arabic' }
  ];

  // Timezones list
  const timezones = [
    'UTC+5 (Pakistan Standard Time)',
    'UTC+0 (GMT)',
    'UTC-5 (Eastern Time)',
    'UTC+1 (Central European Time)',
    'UTC+8 (China Standard Time)'
  ];

  // Date formats list
  const dateFormats = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD',
    'MMMM D, YYYY'
  ];

  // Auto logout options (in minutes)
  const autoLogoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 0, label: 'Never' }
  ];

  // Initialize with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Computer Science',
        semester: user.semester || '4',
        studentId: user.studentId || '2024-cs-472'
      });
    }
  }, [user]);

  // Handle profile input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle security input changes
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Toggle notification preference
  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Update face recognition setting
  const updateFaceSetting = (key, value) => {
    setFaceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update system setting
  const updateSystemSetting = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Validate profile data
  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!profileData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(profileData.phone)) {
      newErrors.phone = 'Phone must be 11 digits';
    }
    
    return newErrors;
  };

  // Validate security data
  const validateSecurity = () => {
    const newErrors = {};
    
    if (securityData.newPassword) {
      if (securityData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (!/(?=.*[A-Z])(?=.*\d)/.test(securityData.newPassword)) {
        newErrors.newPassword = 'Password must contain uppercase and number';
      }
      
      if (securityData.newPassword !== securityData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return newErrors;
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    const validationErrors = validateProfile();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      // Clear errors
      setErrors({});
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save security
  const handleSaveSecurity = async () => {
    const validationErrors = validateSecurity();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (!securityData.currentPassword && securityData.newPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus({
        type: 'success',
        message: 'Security settings updated successfully!'
      });
      
      // Clear form
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear errors
      setErrors({});
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to update security settings. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save all settings
  const handleSaveAll = async () => {
    let validationErrors = {};
    
    if (activeTab === 'profile') {
      validationErrors = validateProfile();
    } else if (activeTab === 'security') {
      validationErrors = validateSecurity();
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveStatus({
        type: 'success',
        message: 'All settings saved successfully!'
      });
      
      // Clear form data for security tab
      if (activeTab === 'security') {
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
      
      // Clear errors
      setErrors({});
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset notification preferences
      setNotifications({
        emailNotifications: true,
        pushNotifications: true,
        attendanceAlerts: true,
        lowAttendanceAlerts: true,
        reportAlerts: false,
        systemUpdates: true
      });
      
      // Reset face recognition settings
      setFaceSettings({
        autoCapture: true,
        enableSound: true,
        flashEffect: false,
        detectionSensitivity: 75,
        maxRetryAttempts: 3,
        saveFaceImages: false
      });
      
      // Reset system preferences
      setSystemSettings({
        theme: 'light',
        language: 'en',
        timezone: 'UTC+5',
        dateFormat: 'MM/DD/YYYY',
        autoLogout: 30,
        dataSavingMode: false,
        highContrast: false
      });
      
      alert('Settings have been reset to default values.');
    }
  };

  // Handle clear all data
  const handleClearData = () => {
    if (window.confirm('WARNING: This will clear all your local data including preferences. Are you sure?')) {
      // Clear local storage
      localStorage.clear();
      
      // Reload page to reset state
      window.location.reload();
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'face-recognition', label: 'Face Recognition', icon: <FaCamera /> },
    { id: 'system', label: 'System', icon: <FaCog /> }
  ];

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h3>
                <FaUser />
                Personal Information
              </h3>
              <p>Update your personal details and academic information</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <FaUser />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaPhone />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="03XX-XXXXXXX"
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaGraduationCap />
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  className="form-input"
                  value={profileData.studentId}
                  onChange={handleProfileChange}
                  disabled
                />
                <div className="form-hint">Student ID cannot be changed</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaUniversity />
                  Department
                </label>
                <select
                  name="department"
                  className="form-input"
                  value={profileData.department}
                  onChange={handleProfileChange}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  name="semester"
                  className="form-input"
                  value={profileData.semester}
                  onChange={handleProfileChange}
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="profile-image-section">
              <h4>Profile Picture</h4>
              <div className="profile-image-container">
                <div className="profile-image-preview">
                  <FaUser />
                </div>
                <div className="profile-image-actions">
                  <button className="btn btn-outline btn-sm">
                    Upload New
                  </button>
                  <button className="btn btn-outline btn-sm">
                    Remove
                  </button>
                </div>
              </div>
              <p className="image-hint">Recommended: Square image, 200x200 pixels or larger</p>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h3>
                <FaShieldAlt />
                Account Security
              </h3>
              <p>Manage your password and security preferences</p>
            </div>
            
            <div className="security-alert">
              <FaInfoCircle />
              <div>
                <strong>Security Tip:</strong> Use a strong, unique password and change it regularly.
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <FaKey />
                  Current Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                    value={securityData.currentPassword}
                    onChange={handleSecurityChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaKey />
                  New Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                    value={securityData.newPassword}
                    onChange={handleSecurityChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
                <div className="password-hints">
                  <p className={`hint ${securityData.newPassword.length >= 8 ? 'valid' : ''}`}>
                    • At least 8 characters
                  </p>
                  <p className={`hint ${/[A-Z]/.test(securityData.newPassword) ? 'valid' : ''}`}>
                    • One uppercase letter
                  </p>
                  <p className={`hint ${/\d/.test(securityData.newPassword) ? 'valid' : ''}`}>
                    • One number
                  </p>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaKey />
                  Confirm New Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    value={securityData.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>
            
            <div className="security-settings">
              <h4>Additional Security</h4>
              <div className="security-options">
                <label className="checkbox-option">
                  <input type="checkbox" defaultChecked />
                  <span>Require password for important changes</span>
                </label>
                <label className="checkbox-option">
                  <input type="checkbox" defaultChecked />
                  <span>Send security alerts to email</span>
                </label>
                <label className="checkbox-option">
                  <input type="checkbox" />
                  <span>Enable two-factor authentication</span>
                </label>
                <label className="checkbox-option">
                  <input type="checkbox" defaultChecked />
                  <span>Show login history</span>
                </label>
              </div>
            </div>
            
            <div className="danger-zone">
              <h4>
                <FaExclamationTriangle />
                Danger Zone
              </h4>
              <div className="danger-actions">
                <button className="btn btn-outline" onClick={handleClearData}>
                  <FaTrash />
                  Clear All Local Data
                </button>
                <button className="btn btn-outline">
                  <FaTimesCircle />
                  Deactivate Account
                </button>
              </div>
              <p className="danger-warning">
                Warning: These actions are irreversible. Please proceed with caution.
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h3>
                <FaBell />
                Notification Preferences
              </h3>
              <p>Choose what notifications you want to receive</p>
            </div>
            
            <div className="notification-categories">
              <div className="notification-category">
                <h4>Email Notifications</h4>
                <div className="notification-options">
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <div className="toggle-label">Email Notifications</div>
                      <div className="toggle-description">Receive notifications via email</div>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={() => toggleNotification('emailNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <div className="toggle-label">Attendance Reports</div>
                      <div className="toggle-description">Weekly and monthly attendance summaries</div>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.reportAlerts}
                        onChange={() => toggleNotification('reportAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <div className="toggle-label">System Updates</div>
                      <div className="toggle-description">Important system announcements and updates</div>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.systemUpdates}
                        onChange={() => toggleNotification('systemUpdates')}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="notification-category">
                <h4>In-App Notifications</h4>
                <div className="notification-options">
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <div className="toggle-label">Push Notifications</div>
                      <div className="toggle-description">Receive push notifications in the app</div>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={() => toggleNotification('pushNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <div className="toggle-label">Attendance Alerts</div>
                      <div className="toggle-description">Notifications when attendance is marked</div>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.attendanceAlerts}
                        onChange={() => toggleNotification('attendanceAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                  
                  <label className="toggle-option">
                    <div className="toggle-info">
                      <div className="toggle-label">Low Attendance Alerts</div>
                      <div className="toggle-description">Alerts when attendance falls below threshold</div>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notifications.lowAttendanceAlerts}
                        onChange={() => toggleNotification('lowAttendanceAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="notification-frequency">
              <h4>Notification Frequency</h4>
              <div className="frequency-options">
                <label className="radio-option">
                  <input type="radio" name="frequency" defaultChecked />
                  <span>Real-time (Immediate notifications)</span>
                </label>
                <label className="radio-option">
                  <input type="radio" name="frequency" />
                  <span>Daily Digest (Once per day)</span>
                </label>
                <label className="radio-option">
                  <input type="radio" name="frequency" />
                  <span>Weekly Summary (Once per week)</span>
                </label>
              </div>
            </div>
            
            <div className="notification-preview">
              <h4>Preview</h4>
              <div className="preview-card">
                <div className="preview-header">
                  <FaBell />
                  <div>
                    <div className="preview-title">Attendance Marked Successfully</div>
                    <div className="preview-time">Just now</div>
                  </div>
                </div>
                <div className="preview-body">
                  Your attendance has been marked for Data Structures class.
                </div>
              </div>
            </div>
          </div>
        );

      case 'face-recognition':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h3>
                <FaCamera />
                Face Recognition Settings
              </h3>
              <p>Configure how the face recognition system works</p>
            </div>
            
            <div className="face-settings">
              <div className="setting-group">
                <label className="toggle-option">
                  <div className="toggle-info">
                    <div className="toggle-label">Auto Capture</div>
                    <div className="toggle-description">Automatically capture face when detected</div>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={faceSettings.autoCapture}
                      onChange={(e) => updateFaceSetting('autoCapture', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                
                <label className="toggle-option">
                  <div className="toggle-info">
                    <div className="toggle-label">Enable Sound</div>
                    <div className="toggle-description">Play sound when attendance is marked</div>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={faceSettings.enableSound}
                      onChange={(e) => updateFaceSetting('enableSound', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                
                <label className="toggle-option">
                  <div className="toggle-info">
                    <div className="toggle-label">Flash Effect</div>
                    <div className="toggle-description">Show flash effect during face capture</div>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={faceSettings.flashEffect}
                      onChange={(e) => updateFaceSetting('flashEffect', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                
                <label className="toggle-option">
                  <div className="toggle-info">
                    <div className="toggle-label">Save Face Images</div>
                    <div className="toggle-description">Store captured face images (for debugging)</div>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={faceSettings.saveFaceImages}
                      onChange={(e) => updateFaceSetting('saveFaceImages', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>
              
              <div className="slider-setting">
                <div className="slider-header">
                  <div className="slider-label">Detection Sensitivity</div>
                  <div className="slider-value">{faceSettings.detectionSensitivity}%</div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={faceSettings.detectionSensitivity}
                  onChange={(e) => updateFaceSetting('detectionSensitivity', parseInt(e.target.value))}
                  className="sensitivity-slider"
                />
                <div className="slider-hints">
                  <span>Low (Faster)</span>
                  <span>High (More Accurate)</span>
                </div>
              </div>
              
              <div className="select-setting">
                <label className="select-label">Maximum Retry Attempts</label>
                <select
                  className="form-input"
                  value={faceSettings.maxRetryAttempts}
                  onChange={(e) => updateFaceSetting('maxRetryAttempts', parseInt(e.target.value))}
                >
                  <option value="1">1 attempt</option>
                  <option value="2">2 attempts</option>
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="10">10 attempts</option>
                </select>
              </div>
            </div>
            
            <div className="face-training">
              <h4>Face Model Training</h4>
              <p>Improve recognition accuracy by training with different angles</p>
              <div className="training-actions">
                <button className="btn btn-outline">
                  <FaSync />
                  Retrain Face Model
                </button>
                <button className="btn btn-outline">
                  <FaDatabase />
                  View Training Data
                </button>
              </div>
            </div>
            
            <div className="camera-test">
              <h4>Camera Test</h4>
              <div className="camera-preview">
                <div className="camera-placeholder">
                  <FaCamera />
                  <p>Camera Preview</p>
                </div>
              </div>
              <div className="camera-test-actions">
                <button className="btn btn-outline">
                  Test Camera
                </button>
                <button className="btn btn-outline">
                  Calibrate
                </button>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="tab-content">
            <div className="section-header">
              <h3>
                <FaCog />
                System Preferences
              </h3>
              <p>Customize the application appearance and behavior</p>
            </div>
            
            <div className="system-settings-grid">
              <div className="setting-card">
                <div className="setting-icon">
                  <FaPalette />
                </div>
                <div className="setting-content">
                  <h4>Theme</h4>
                  <div className="theme-options">
                    {themes.map(theme => (
                      <label 
                        key={theme.value} 
                        className={`theme-option ${systemSettings.theme === theme.value ? 'active' : ''}`}
                        onClick={() => updateSystemSetting('theme', theme.value)}
                      >
                        <span className="theme-icon">{theme.icon}</span>
                        <span className="theme-label">{theme.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="setting-card">
                <div className="setting-icon">
                  <FaDesktop />
                </div>
                <div className="setting-content">
                  <h4>Language</h4>
                  <select
                    className="form-input"
                    value={systemSettings.language}
                    onChange={(e) => updateSystemSetting('language', e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="setting-card">
                <div className="setting-icon">
                  <FaMobileAlt />
                </div>
                <div className="setting-content">
                  <h4>Timezone</h4>
                  <select
                    className="form-input"
                    value={systemSettings.timezone}
                    onChange={(e) => updateSystemSetting('timezone', e.target.value)}
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="setting-card">
                <div className="setting-icon">
                  <FaCalendarAlt />
                </div>
                <div className="setting-content">
                  <h4>Date Format</h4>
                  <select
                    className="form-input"
                    value={systemSettings.dateFormat}
                    onChange={(e) => updateSystemSetting('dateFormat', e.target.value)}
                  >
                    {dateFormats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="advanced-settings">
              <h4>Advanced Settings</h4>
              <div className="advanced-grid">
                <div className="form-group">
                  <label className="form-label">Auto Logout</label>
                  <select
                    className="form-input"
                    value={systemSettings.autoLogout}
                    onChange={(e) => updateSystemSetting('autoLogout', parseInt(e.target.value))}
                  >
                    {autoLogoutOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={systemSettings.dataSavingMode}
                      onChange={(e) => updateSystemSetting('dataSavingMode', e.target.checked)}
                    />
                    <span>Data Saving Mode</span>
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={systemSettings.highContrast}
                      onChange={(e) => updateSystemSetting('highContrast', e.target.checked)}
                    />
                    <span>High Contrast Mode</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="system-actions">
              <button className="btn btn-outline" onClick={handleResetDefaults}>
                <FaUndo />
                Reset to Defaults
              </button>
              <button className="btn btn-outline">
                <FaSync />
                Check for Updates
              </button>
              <button className="btn btn-outline">
                <FaDatabase />
                Clear Cache
              </button>
            </div>
            
            <div className="system-info">
              <h4>System Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">App Version</span>
                  <span className="info-value">1.0.0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">March 15, 2024</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Database Size</span>
                  <span className="info-value">45.2 MB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Storage Used</span>
                  <span className="info-value">125 MB / 1 GB</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <FaCog className="header-icon" />
          Settings
        </h1>
        <p>Customize your Smart Presence experience</p>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <div className={`save-alert ${saveStatus.type}`}>
          {saveStatus.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      <div className="settings-container">
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          <div className="sidebar-header">
            <h3>Settings</h3>
          </div>
          
          <nav className="settings-nav">
            <ul className="nav-list">
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <button 
              className="btn btn-primary btn-block"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="spinner-small"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .settings-page {
          padding: 1rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          border-radius: 1rem;
          color: white;
        }
        
        .page-header h1 {
          margin: 0 0 0.5rem 0;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
        }
        
        .header-icon {
          font-size: 2rem;
        }
        
        .page-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }
        
        .save-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 0.75rem;
          font-weight: 500;
        }
        
        .save-alert.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .save-alert.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        
        .settings-container {
          display: flex;
          gap: 1.5rem;
          min-height: 600px;
        }
        
        @media (max-width: 1024px) {
          .settings-container {
            flex-direction: column;
          }
        }
        
        .settings-sidebar {
          width: 250px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        
        @media (max-width: 1024px) {
          .settings-sidebar {
            width: 100%;
          }
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .sidebar-header h3 {
          margin: 0;
          color: #1f2937;
        }
        
        .settings-nav {
          flex: 1;
          padding: 1rem 0;
        }
        
        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          text-align: left;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .nav-item:hover {
          background: #f9fafb;
          color: #4f46e5;
        }
        
        .nav-item.active {
          background: #eef2ff;
          color: #4f46e5;
          border-left-color: #4f46e5;
          font-weight: 500;
        }
        
        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }
        
        .nav-label {
          font-size: 0.875rem;
        }
        
        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-block {
          width: 100%;
        }
        
        .spinner-small {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }
        
        .settings-content {
          flex: 1;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          overflow-y: auto;
        }
        
        .section-header {
          margin-bottom: 2rem;
        }
        
        .section-header h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
        }
        
        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .form-input.error {
          border-color: #ef4444;
        }
        
        .form-error {
          display: block;
          margin-top: 0.25rem;
          color: #ef4444;
          font-size: 0.75rem;
        }
        
        .form-hint {
          margin-top: 0.25rem;
          color: #6b7280;
          font-size: 0.75rem;
        }
        
        .password-input-container {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
        }
        
        .password-hints {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 0.375rem;
        }
        
        .hint {
          margin: 0.25rem 0;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .hint.valid {
          color: #10b981;
        }
        
        .profile-image-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .profile-image-section h4 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .profile-image-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .profile-image-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #6b7280;
          border: 2px dashed #d1d5db;
        }
        
        .profile-image-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .image-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }
        
        .security-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .security-settings {
          margin: 2rem 0;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .security-settings h4 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .security-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #4b5563;
        }
        
        .danger-zone {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #fef2f2;
          border-radius: 0.75rem;
          border: 1px solid #fecaca;
        }
        
        .danger-zone h4 {
          margin: 0 0 1rem 0;
          color: #991b1b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .danger-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .danger-warning {
          margin: 0;
          font-size: 0.75rem;
          color: #dc2626;
        }
        
        .notification-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .notification-category h4 {
          margin-bottom: 1rem;
          color: #374151;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .notification-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .toggle-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .toggle-info {
          flex: 1;
        }
        
        .toggle-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        
        .toggle-description {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .toggle-switch {
          position: relative;
          width: 50px;
          height: 26px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #d1d5db;
          transition: .4s;
          border-radius: 13px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #4f46e5;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
        
        .notification-frequency {
          margin-bottom: 2rem;
        }
        
        .notification-frequency h4 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .frequency-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #4b5563;
        }
        
        .notification-preview {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .notification-preview h4 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .preview-card {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          max-width: 400px;
        }
        
        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .preview-title {
          font-weight: 500;
          color: #374151;
        }
        
        .preview-time {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .preview-body {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .face-settings {
          margin-bottom: 2rem;
        }
        
        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .slider-setting {
          margin-bottom: 2rem;
        }
        
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .slider-label {
          font-weight: 500;
          color: #374151;
        }
        
        .slider-value {
          font-weight: 600;
          color: #4f46e5;
        }
        
        .sensitivity-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #ef4444, #f59e0b, #10b981);
          outline: none;
          -webkit-appearance: none;
        }
        
        .sensitivity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .slider-hints {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .select-setting {
          margin-bottom: 2rem;
        }
        
        .select-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .face-training,
        .camera-test {
          margin: 2rem 0;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .face-training h4,
        .camera-test h4 {
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        .training-actions,
        .camera-test-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .camera-preview {
          height: 200px;
          background: #1f2937;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem 0;
        }
        
        .camera-placeholder {
          text-align: center;
          color: #9ca3af;
        }
        
        .system-settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .setting-card {
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        
        .setting-icon {
          font-size: 2rem;
          color: #4f46e5;
          margin-bottom: 1rem;
        }
        
        .setting-content h4 {
          margin: 0 0 1rem 0;
          color: #374151;
        }
        
        .theme-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 80px;
        }
        
        .theme-option:hover {
          border-color: #4f46e5;
        }
        
        .theme-option.active {
          background: #eef2ff;
          border-color: #4f46e5;
        }
        
        .theme-icon {
          font-size: 1.5rem;
        }
        
        .theme-label {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .advanced-settings {
          margin: 2rem 0;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .advanced-settings h4 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .advanced-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .system-actions {
          display: flex;
          gap: 0.5rem;
          margin: 2rem 0;
        }
        
        .system-info {
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .system-info h4 {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .info-value {
          font-weight: 500;
          color: #374151;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .settings-page {
            padding: 0.5rem;
          }
          
          .page-header {
            padding: 1rem;
            text-align: center;
          }
          
          .page-header h1 {
            font-size: 1.5rem;
            justify-content: center;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .notification-categories {
            grid-template-columns: 1fr;
          }
          
          .system-settings-grid {
            grid-template-columns: 1fr;
          }
          
          .danger-actions,
          .training-actions,
          .camera-test-actions,
          .system-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;
