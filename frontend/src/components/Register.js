import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCamera, FaGraduationCap, FaCheckCircle, FaSync } from 'react-icons/fa';
import Webcam from 'react-webcam';
import axios from 'axios';
import './Register.css';

const API_URL = 'http://localhost:5000/api';

function Register({ onRegister }) {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science',
    userType: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoConstraints = {
    width: 400,
    height: 300,
    facingMode: "user"
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!capturedImage) newErrors.face = 'Face capture is required for registration';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Generate a user ID
        const userId = `2024-${formData.department.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
        
        // Convert base64 image to blob
        const base64Response = await fetch(capturedImage);
        const blob = await base64Response.blob();
        
        // Create form data for API
        const apiFormData = new FormData();
        apiFormData.append('user_id', userId);
        apiFormData.append('name', formData.name);
        apiFormData.append('email', formData.email);
        apiFormData.append('password', formData.password);
        apiFormData.append('role', formData.userType);
        apiFormData.append('department', formData.department);
        apiFormData.append('face_image', blob, 'face.jpg');

        const response = await axios.post(`${API_URL}/auth/register`, apiFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onRegister(response.data.user);
          alert('Registration successful! Your face has been captured for attendance verification.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
        setErrors({ submit: errorMessage });
        alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <FaCamera className="register-logo" />
          <h1>Create Account</h1>
          <p>Join Smart Presence today</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label><FaUser /> Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label><FaEnvelope /> Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label><FaGraduationCap /> Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
            </select>
          </div>

          <div className="form-group">
            <label><FaLock /> Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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

          <div className="form-group">
            <label><FaLock /> Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {/* Face Capture Section */}
          <div className="form-group face-capture-section">
            <label><FaCamera /> Capture Your Face (Required)</label>
            <p className="face-capture-info">Your face will be used for attendance verification</p>
            
            {!showCamera && !capturedImage && (
              <button
                type="button"
                className="open-camera-btn"
                onClick={() => setShowCamera(true)}
              >
                <FaCamera /> Open Camera to Capture Face
              </button>
            )}

            {showCamera && (
              <div className="camera-container">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="webcam-preview"
                />
                <div className="camera-buttons">
                  <button type="button" className="capture-btn" onClick={capturePhoto}>
                    <FaCamera /> Capture Photo
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowCamera(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="captured-preview">
                <img src={capturedImage} alt="Captured face" className="face-preview" />
                <div className="capture-success">
                  <FaCheckCircle className="success-icon" />
                  <span>Face captured successfully!</span>
                </div>
                <button type="button" className="retake-btn" onClick={retakePhoto}>
                  <FaSync /> Retake Photo
                </button>
              </div>
            )}
            
            {errors.face && <span className="error-text">{errors.face}</span>}
          </div>

          {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}

          <button type="submit" className="register-btn" disabled={isSubmitting || !capturedImage}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="register-footer">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
