import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaCamera,
  FaChartBar,
  FaSpinner,
  FaSyncAlt
} from 'react-icons/fa';
import './Dashboard.css';

function Dashboard({ user }) {
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    attendancePercentage: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setStats(response.data.stats);
        setRecentAttendance(response.data.recentAttendance || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch data on mount and when navigating to this page
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, location.key]);

  // Auto-refresh when page becomes visible (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchDashboardData]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <FaCheckCircle className="status-icon present" />;
      case 'absent': return <FaTimesCircle className="status-icon absent" />;
      case 'late': return <FaClock className="status-icon late" />;
      default: return null;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="current-time">{time.toLocaleTimeString()}</p>
        </div>
        <div className="header-actions">
          <button 
            className={`refresh-btn ${refreshing ? 'spinning' : ''}`} 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FaSyncAlt /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/mark-attendance" className="mark-attendance-btn">
            <FaCamera /> Mark Attendance
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total"><FaCalendarAlt /></div>
              <div className="stat-content">
                <h3>{stats.totalAttendance}</h3>
                <p>Total Records</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon present"><FaCheckCircle /></div>
              <div className="stat-content">
                <h3>{stats.presentDays}</h3>
                <p>Present</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon absent"><FaTimesCircle /></div>
              <div className="stat-content">
                <h3>{stats.absentDays}</h3>
                <p>Absent</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon late"><FaClock /></div>
              <div className="stat-content">
                <h3>{stats.lateDays}</h3>
                <p>Late</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="card attendance-percentage">
              <h2><FaChartBar /> Attendance Overview</h2>
              <div className="percentage-display">
                <div className="percentage-circle">
                  <span className="percentage-value">{stats.attendancePercentage}%</span>
                </div>
                <p>Overall Attendance</p>
              </div>
            </div>

            <div className="card recent-attendance">
              <h2><FaCalendarAlt /> Recent Attendance</h2>
              <div className="attendance-list">
                {recentAttendance.length === 0 ? (
                  <div className="no-data">
                    <p>No attendance records yet. Mark your first attendance!</p>
                  </div>
                ) : (
                  recentAttendance.map((record, index) => (
                    <div key={record.id || index} className="attendance-item">
                      {getStatusIcon(record.status)}
                      <div className="attendance-details">
                        <h4>{record.subject || 'Attendance'}</h4>
                        <p>{formatDate(record.date)} at {formatTime(record.time)}</p>
                      </div>
                      <span className={`status-badge ${record.status}`}>
                        {record.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card user-info">
            <h2><FaUser /> Profile Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{user?.name || 'User'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user?.email || 'user@example.com'}</p>
              </div>
              <div className="info-item">
                <label>Department</label>
                <p>{user?.department || 'Not specified'}</p>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <p>{user?.id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
