import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaCamera, 
  FaChartBar, 
  FaCog, 
  FaUser,
  FaUserShield
} from 'react-icons/fa';
import './Sidebar.css';

function Sidebar({ user }) {
  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/attendance', icon: <FaCamera />, label: 'Attendance' },
    { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  // Add admin menu item if user is admin
  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: <FaUserShield />, label: 'Admin Panel' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="user-avatar">
          <FaUser />
        </div>
        <div className="user-info">
          <h4>{user?.name || 'User'}</h4>
          <p>{user?.role || 'Student'}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Smart Presence v1.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
