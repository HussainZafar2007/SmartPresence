import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserPlus, 
  FaTrash, 
  FaEdit, 
  FaSearch,
  FaChartBar,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSyncAlt,
  FaKey,
  FaUserShield,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [stats, setStats] = useState({
    total_users: 0,
    today_attendance: 0,
    today_stats: { present: 0, absent: 0, late: 0 },
    department_counts: []
  });
  const [users, setUsers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '', department: '' });
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/attendance`, { 
        headers,
        params: { date: dateFilter }
      });
      setAttendanceRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, [dateFilter]);

  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    await Promise.all([fetchStats(), fetchUsers(), fetchAttendance()]);
    
    setLoading(false);
    setRefreshing(false);
  }, [fetchStats, fetchUsers, fetchAttendance]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance();
    }
  }, [dateFilter, activeTab, fetchAttendance]);

  // User actions
  const handleViewUser = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, { headers });
      setSelectedUser(response.data);
      setShowUserDetailModal(true);
    } catch (error) {
      alert('Error fetching user details');
    }
  };

  const handleEditUser = (userItem) => {
    setSelectedUser(userItem);
    setEditFormData({
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      department: userItem.department || '',
      semester: userItem.semester || '',
      phone: userItem.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`${API_URL}/admin/users/${selectedUser.user_id}`, editFormData, { headers });
      alert('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      alert('Error updating user');
    }
  };

  const handleDeleteUser = (userItem) => {
    setSelectedUser(userItem);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}/admin/users/${selectedUser.user_id}`, { headers });
      alert('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password to default (password123)?')) return;
    try {
      const response = await axios.post(`${API_URL}/admin/users/${userId}/reset-password`, {}, { headers });
      alert(`Password reset successfully. New password: ${response.data.temp_password}`);
    } catch (error) {
      alert('Error resetting password');
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await axios.post(`${API_URL}/admin/create-admin`, newAdminData, { headers });
      alert('Admin user created successfully');
      setShowCreateAdminModal(false);
      setNewAdminData({ name: '', email: '', password: '', department: '' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating admin');
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await axios.delete(`${API_URL}/admin/attendance/${attendanceId}`, { headers });
      fetchAttendance();
      fetchStats();
    } catch (error) {
      alert('Error deleting attendance');
    }
  };

  const handleUpdateAttendanceStatus = async (attendanceId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/attendance/${attendanceId}`, { status: newStatus }, { headers });
      fetchAttendance();
      fetchStats();
    } catch (error) {
      alert('Error updating attendance');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
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

  if (loading) {
    return (
      <div className="admin-loading">
        <FaSyncAlt className="spinner" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1><FaUserShield /> Admin Dashboard</h1>
          <p>Manage users, attendance, and system settings</p>
        </div>
        <div className="admin-header-actions">
          <button 
            className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
          >
            <FaSyncAlt /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreateAdminModal(true)}>
            <FaUserPlus /> Add Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartBar /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Users
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FaCalendarAlt /> Attendance
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-overview">
          <div className="stats-cards">
            <div className="stat-card total">
              <FaUsers className="stat-icon" />
              <div>
                <h3>{stats.total_users}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card present">
              <FaCheckCircle className="stat-icon" />
              <div>
                <h3>{stats.today_stats?.present || 0}</h3>
                <p>Present Today</p>
              </div>
            </div>
            <div className="stat-card late">
              <FaClock className="stat-icon" />
              <div>
                <h3>{stats.today_stats?.late || 0}</h3>
                <p>Late Today</p>
              </div>
            </div>
            <div className="stat-card absent">
              <FaTimesCircle className="stat-icon" />
              <div>
                <h3>{stats.today_stats?.absent || 0}</h3>
                <p>Absent Today</p>
              </div>
            </div>
          </div>

          <div className="overview-grid">
            <div className="card">
              <h2>Department Distribution</h2>
              <div className="department-list">
                {stats.department_counts?.length > 0 ? (
                  stats.department_counts.map((dept, index) => (
                    <div key={index} className="department-item">
                      <span>{dept.department || 'Not Specified'}</span>
                      <span className="count">{dept.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No department data available</p>
                )}
              </div>
            </div>
            
            <div className="card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <button onClick={() => setActiveTab('users')}>
                  <FaUsers /> Manage Users
                </button>
                <button onClick={() => setActiveTab('attendance')}>
                  <FaCalendarAlt /> View Attendance
                </button>
                <button onClick={() => setShowCreateAdminModal(true)}>
                  <FaUserPlus /> Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="users-toolbar">
            <div className="search-box">
              <FaSearch />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="user-count">{filteredUsers.length} users</span>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                    <tr key={userItem.user_id}>
                      <td>{userItem.user_id}</td>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`role-badge ${userItem.role}`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td>{userItem.department || '-'}</td>
                      <td className="actions">
                        <button 
                          className="btn-icon view" 
                          title="View"
                          onClick={() => handleViewUser(userItem.user_id)}
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="btn-icon edit" 
                          title="Edit"
                          onClick={() => handleEditUser(userItem)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon reset" 
                          title="Reset Password"
                          onClick={() => handleResetPassword(userItem.user_id)}
                        >
                          <FaKey />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          title="Delete"
                          onClick={() => handleDeleteUser(userItem)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="admin-attendance">
          <div className="attendance-toolbar">
            <div className="date-filter">
              <label>Date:</label>
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <span className="record-count">{attendanceRecords.length} records</span>
          </div>

          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No attendance records found</td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.name}</td>
                      <td>{record.department || '-'}</td>
                      <td>{formatDate(record.date)}</td>
                      <td>{formatTime(record.time)}</td>
                      <td>
                        <select 
                          value={record.status}
                          onChange={(e) => handleUpdateAttendanceStatus(record.id, e.target.value)}
                          className={`status-select ${record.status}`}
                        >
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                      <td className="actions">
                        <button 
                          className="btn-icon delete" 
                          title="Delete"
                          onClick={() => handleDeleteAttendance(record.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2><FaEdit /> Edit User</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editFormData.name || ''} 
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editFormData.email || ''} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={editFormData.role || 'student'} 
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input 
                  type="text" 
                  value={editFormData.department || ''} 
                  onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  value={editFormData.phone || ''} 
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdateUser}>
                <FaCheck /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2><FaExclamationTriangle /> Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?</p>
              <p className="warning">This will also delete all their attendance records. This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDeleteUser}>
                <FaTrash /> Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal user-detail-modal">
            <div className="modal-header">
              <h2><FaEye /> User Details</h2>
              <button className="close-btn" onClick={() => setShowUserDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail-grid">
                <div className="detail-item">
                  <label>User ID</label>
                  <p>{selectedUser.user?.user_id}</p>
                </div>
                <div className="detail-item">
                  <label>Name</label>
                  <p>{selectedUser.user?.name}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedUser.user?.email}</p>
                </div>
                <div className="detail-item">
                  <label>Role</label>
                  <p className={`role-badge ${selectedUser.user?.role}`}>{selectedUser.user?.role}</p>
                </div>
                <div className="detail-item">
                  <label>Department</label>
                  <p>{selectedUser.user?.department || 'Not specified'}</p>
                </div>
                <div className="detail-item">
                  <label>Joined</label>
                  <p>{formatDate(selectedUser.user?.created_at)}</p>
                </div>
              </div>
              <h3>Attendance Statistics</h3>
              <div className="attendance-stats">
                <div className="stat present">
                  <span>{selectedUser.attendance_stats?.present || 0}</span>
                  <label>Present</label>
                </div>
                <div className="stat late">
                  <span>{selectedUser.attendance_stats?.late || 0}</span>
                  <label>Late</label>
                </div>
                <div className="stat absent">
                  <span>{selectedUser.attendance_stats?.absent || 0}</span>
                  <label>Absent</label>
                </div>
                <div className="stat total">
                  <span>{selectedUser.attendance_stats?.total || 0}</span>
                  <label>Total</label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUserDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2><FaUserPlus /> Create Admin User</h2>
              <button className="close-btn" onClick={() => setShowCreateAdminModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={newAdminData.name} 
                  onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={newAdminData.email} 
                  onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input 
                  type="password" 
                  value={newAdminData.password} 
                  onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input 
                  type="text" 
                  value={newAdminData.department} 
                  onChange={(e) => setNewAdminData({...newAdminData, department: e.target.value})}
                  placeholder="Enter department"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateAdminModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateAdmin}>
                <FaUserPlus /> Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
