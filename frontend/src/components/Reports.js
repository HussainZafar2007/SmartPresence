import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaChartBar, 
  FaDownload, 
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaSyncAlt
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Reports({ user }) {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const location = useLocation();

  const fetchReportsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      
      // Get date range based on selection
      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'semester':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      // Fetch dashboard stats
      const statsResponse = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsResponse.data) {
        setStats(statsResponse.data.stats);
        setMonthlyData(statsResponse.data.monthlyData || []);
      }

      // Fetch attendance history
      const historyResponse = await axios.get('http://localhost:5000/api/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });

      if (historyResponse.data) {
        setAttendanceRecords(historyResponse.data.records || []);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  // Fetch data on mount and when navigating to this page
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData, location.key]);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReportsData(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchReportsData]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchReportsData(true);
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const barChartData = {
    labels: monthlyData.map(d => getMonthName(d.month)).reverse(),
    datasets: [
      {
        label: 'Present',
        data: [...monthlyData].reverse().map(d => d.present || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Absent',
        data: [...monthlyData].reverse().map(d => d.absent || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'Late',
        data: [...monthlyData].reverse().map(d => d.late || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  const pieChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [stats.presentDays, stats.absentDays, stats.lateDays],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
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

  const exportToCSV = () => {
    if (attendanceRecords.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Date', 'Time', 'Status', 'Subject'];
    const csvContent = [
      headers.join(','),
      ...attendanceRecords.map(record => 
        [record.date, record.time, record.status, record.subject || 'N/A'].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1><FaChartBar /> Attendance Reports</h1>
          <p>View and analyze your attendance data</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn btn-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FaSyncAlt /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary" onClick={exportToCSV}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading reports data...</p>
        </div>
      ) : (
        <>
          <div className="stats-summary">
            <div className="stat-card">
              <FaCheckCircle className="stat-icon present" />
              <div>
                <h3>{stats.presentDays}</h3>
                <p>Present Days</p>
              </div>
            </div>
            <div className="stat-card">
              <FaTimesCircle className="stat-icon absent" />
              <div>
                <h3>{stats.absentDays}</h3>
                <p>Absent Days</p>
              </div>
            </div>
            <div className="stat-card">
              <FaClock className="stat-icon late" />
              <div>
                <h3>{stats.lateDays}</h3>
                <p>Late Days</p>
              </div>
            </div>
            <div className="stat-card">
              <FaCalendarAlt className="stat-icon total" />
              <div>
                <h3>{stats.totalAttendance}</h3>
                <p>Total Records</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <h2>Monthly Attendance</h2>
              {monthlyData.length > 0 ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <p className="no-data">No monthly data available yet</p>
              )}
            </div>
            <div className="card">
              <h2>Attendance Distribution</h2>
              {stats.totalAttendance > 0 ? (
                <Pie data={pieChartData} options={chartOptions} />
              ) : (
                <p className="no-data">No attendance data available yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2><FaCalendarAlt /> Detailed Records</h2>
            <div className="table-container">
              {attendanceRecords.length === 0 ? (
                <p className="no-data">No attendance records found for the selected period</p>
              ) : (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Time In</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record, index) => (
                      <tr key={record.id || index}>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.subject || 'Attendance'}</td>
                        <td>{formatTime(record.time)}</td>
                        <td><span className={`badge ${record.status}`}>{record.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
