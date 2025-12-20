import React, { useState } from 'react';
import AttendanceForm from './AttendanceForm';

const Dashboard = ({ user }) => {
  const [attendance] = useState([
    { date: '2024-01-15', subject: 'Mathematics', status: 'Present', time: '09:00 AM' },
    { date: '2024-01-16', subject: 'Physics', status: 'Present', time: '10:00 AM' },
    { date: '2024-01-17', subject: 'Chemistry', status: 'Absent', time: '11:00 AM' },
    { date: '2024-01-18', subject: 'Computer Science', status: 'Present', time: '02:00 PM' },
  ]);

  const stats = {
    totalClasses: 30,
    attended: 25,
    percentage: 83.3
  };

  const styles = {
    container: {
      padding: '30px 20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '40px',
      textAlign: 'center'
    },
    welcome: {
      fontSize: '36px',
      color: '#00ffff',
      marginBottom: '10px',
      textShadow: '0 0 15px rgba(0, 255, 255, 0.8)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '25px',
      marginBottom: '40px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '30px',
      borderRadius: '15px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))'
    },
    statNumber: {
      fontSize: '42px',
      fontWeight: 'bold',
      color: '#ff00ff',
      marginBottom: '10px',
      textShadow: '0 0 15px rgba(255, 0, 255, 0.8)'
    },
    statLabel: {
      fontSize: '16px',
      color: '#00ffff',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '30px'
    },
    section: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '30px',
      borderRadius: '15px',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))'
    },
    sectionTitle: {
      fontSize: '24px',
      color: '#00ffff',
      marginBottom: '25px',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    },
    statusPresent: {
      color: '#00ff00',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
    },
    statusAbsent: {
      color: '#ff0000',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.welcome} className="neon-text">🎯 WELCOME, {user.name}!</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }}>
          Student ID: <span style={{ color: '#ff00ff' }}>{user.studentId}</span>
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalClasses}</div>
          <div style={styles.statLabel}>📚 Total Classes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.attended}</div>
          <div style={styles.statLabel}>✅ Classes Attended</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.percentage}%</div>
          <div style={styles.statLabel}>📊 Attendance %</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📍 MARK ATTENDANCE</h2>
          <AttendanceForm user={user} />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📅 RECENT ATTENDANCE</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.subject}</td>
                  <td>{record.time}</td>
                  <td style={record.status === 'Present' ? styles.statusPresent : styles.statusAbsent}>
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;