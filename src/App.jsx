// App.jsx
import React, { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }
    alert('Account created successfully!')
  }

  const handleCapturePhoto = () => {
    alert('Photo capture functionality would be implemented here!')
  }

  return (
    <div className="app-container">
      <div className="main-container">
        {/* Left Side - Branding */}
        <div className="brand-section">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">👁️</span>
            </div>
            <h1 className="brand-name">Smart Presence</h1>
          </div>
          <div className="brand-tagline">
            <p>Advanced Face Recognition</p>
            <p>Attendance System</p>
          </div>
          
          <div className="features">
            <div className="feature">
              <span className="feature-icon">👤</span>
              <span>Face Recognition Login</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Real-time Analytics</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Secure & Reliable</span>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="form-section">
          <div className="form-container">
            <div className="form-wrapper">
              <div className="form-header">
                <h2>Create Account</h2>
                <p>Join Smart Presence attendance system</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email / ID</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email or ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="photo-section">
                  <div className="photo-notice">
                    <span>📸 Photo capture is mandatory to create an account</span>
                  </div>

                  <div className="camera-preview">
                    <div className="camera-frame">
                      <div className="camera-placeholder">
                        <div className="camera-icon">📷</div>
                        <span>Capture Your Photo</span>
                      </div>
                    </div>
                    <div className="camera-label">LIVE</div>
                  </div>

                  <button 
                    type="button" 
                    className="capture-btn"
                    onClick={handleCapturePhoto}
                  >
                    Capture Photo
                  </button>
                </div>

                <button type="submit" className="submit-btn">
                  Sign Up
                </button>
              </form>

              <div className="auth-switch">
                <p>Already have an account?</p>
                <button 
                  className="switch-btn"
                  onClick={() => window.location.href = '/login'}
                >
                  Login here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App