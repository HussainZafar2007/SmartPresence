import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './AdminSetup.css';

const API_URL = 'http://localhost:5000/api';

function AdminSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Administration'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`);
      // If we get stats, admin might exist
      setAdminExists(false);
    } catch (error) {
      // If unauthorized, it means no admin OR we need to create one
      setAdminExists(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/admin/setup`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create admin');
      if (error.response?.data?.error?.includes('Admin already exists')) {
        setAdminExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (adminExists) {
    return (
      <div className="admin-setup-container">
        <div className="admin-setup-card">
          <div className="setup-header">
            <FaExclamationTriangle className="warning-icon" />
            <h1>Admin Already Exists</h1>
          </div>
          <p>An admin account has already been created. Please login with existing admin credentials.</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-setup-container">
      <div className="admin-setup-card">
        <div className="setup-header">
          <FaUserShield className="admin-icon" />
          <h1>Admin Setup</h1>
          <p>Create the first administrator account</p>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success"><FaCheck /> {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter admin name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Administration"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Admin...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="setup-footer">
          <p>Already have an admin account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

export default AdminSetup;
