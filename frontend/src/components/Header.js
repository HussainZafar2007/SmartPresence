import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaCamera, FaUserCheck, FaHistory } from 'react-icons/fa';
import './Header.css';

function Header({ isAuthenticated, user, onLogout }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show header on kiosk page
  if (location.pathname === '/mark-attendance') {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/mark-attendance" className="logo">
          <FaCamera className="logo-icon" />
          <span>Smart Presence</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          {/* Always show link to kiosk */}
          <Link 
            to="/mark-attendance" 
            className={`nav-link kiosk-link ${location.pathname === '/mark-attendance' ? 'active' : ''}`}
          >
            <FaUserCheck /> Mark Attendance
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/reports" 
                className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
              >
                <FaHistory /> My History
              </Link>
              <Link 
                to="/settings" 
                className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
              >
                Settings
              </Link>
              <div className="user-menu">
                <span className="user-name">
                  <FaUser /> {user?.name || 'User'}
                </span>
                <button className="logout-btn" onClick={onLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login (View History)
              </Link>
              <Link 
                to="/register" 
                className={`nav-link btn-register ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
