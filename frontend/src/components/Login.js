import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './Login.css';

const API_URL = 'http://localhost:5000/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onLogin(formData.email, formData.password, response.data.user);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
        setErrors({ submit: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaCamera className="login-logo" />
          <h1>Smart Presence</h1>
          <p>Facial Recognition Attendance System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="user-type-selector">
            {['student', 'teacher', 'admin'].map((type) => (
              <button
                key={type}
                type="button"
                className={`type-btn ${formData.userType === type ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: type })}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FaUser /> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-footer">
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
