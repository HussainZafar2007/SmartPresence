import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import components from components folder (properly structured)
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Import pages - create simplified versions
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import AttendanceKiosk from './components/AttendanceKiosk';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import AdminSetup from './components/AdminSetup';

// Main App Component
function App() {
  // State for authentication and user data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Function to handle login
  const handleLogin = (email, password, userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Function to handle registration
  const handleRegister = (userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  // Function to mark attendance (will be connected to camera later)
  const markAttendance = () => {
    // Attendance is now handled by the Attendance component with face verification
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  return (
    <Router>
      <div className="app">
        {/* Header - Always visible */}
        <Header 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="main-content">
          {/* Sidebar - Only show when authenticated */}
          {isAuthenticated && <Sidebar user={user} />}
          
          {/* Page Content */}
          <div className={`page-content ${isAuthenticated ? 'with-sidebar' : ''}`}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Routes>
                {/* PUBLIC KIOSK - Main Attendance Marking (No Login Required) */}
                <Route path="/mark-attendance" element={<AttendanceKiosk />} />
                
                {/* Public Routes */}
                <Route path="/login" element={
                  !isAuthenticated ? 
                    <Login onLogin={handleLogin} /> : 
                    <Navigate to="/dashboard" />
                } />
                
                <Route path="/register" element={
                  <Register onRegister={handleRegister} />
                } />
                
                {/* Protected Routes - Require Authentication */}
                <Route path="/dashboard" element={
                  isAuthenticated ? 
                    <Dashboard user={user} /> : 
                    <Navigate to="/login" />
                } />
                
                <Route path="/attendance" element={
                  isAuthenticated ? 
                    <Attendance 
                      user={user} 
                      onMarkAttendance={markAttendance}
                    /> : 
                    <Navigate to="/login" />
                } />
                
                <Route path="/reports" element={
                  isAuthenticated ? 
                    <Reports user={user} /> : 
                    <Navigate to="/login" />
                } />
                
                <Route path="/settings" element={
                  isAuthenticated ? 
                    <Settings user={user} /> : 
                    <Navigate to="/login" />
                } />
                
                {/* Admin Route - Require Admin Role */}
                <Route path="/admin" element={
                  isAuthenticated && user?.role === 'admin' ? 
                    <AdminDashboard user={user} /> : 
                    isAuthenticated ? 
                      <Navigate to="/dashboard" /> : 
                      <Navigate to="/login" />
                } />
                
                {/* Admin Setup - Create first admin */}
                <Route path="/admin-setup" element={<AdminSetup />} />
                
                {/* Default Route - Go to Kiosk */}
                <Route path="/" element={<Navigate to="/mark-attendance" />} />
                
                {/* 404 Page - Simple version */}
                <Route path="*" element={
                  <div className="error-page">
                    <h1>404</h1>
                    <p>Page not found</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.history.back()}
                    >
                      Go Back
                    </button>
                  </div>
                } />
              </Routes>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Smart Presence System. All rights reserved.</p>
            <p>Developed by: Hussain Warraich, Ahmad Murad Naz, Sami Ullah Kokhar, Ali Ahmad</p>
            <p>Supervised by: Dr. Natasha Nigar</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;