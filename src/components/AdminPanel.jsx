import React, { useState } from 'react';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const students = [
    { id: 1, name: 'John Doe', studentId: 'STU001', email: 'john@example.com', department: 'Computer Science', attendance: 85 },
    { id: 2, name: 'Jane Smith', studentId: 'STU002', email: 'jane@example.com', department: 'Physics', attendance: 92 },
    { id: 3, name: 'Mike Johnson', studentId: 'STU003', email: 'mike@example.com', department: 'Mathematics', attendance: 78 },
  ];

  const attendanceRecords = [
    { id: 1, studentName: 'John Doe', studentId: 'STU001', subject: 'Mathematics', date: '2024-01-15', time: '09:00 AM', status: 'Present' },
    { id: 2, studentName: 'Jane Smith', studentId: 'STU002', subject: 'Physics', date: '2024-01-15', time: '10:00 AM', status: 'Present' },
  ];

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
    title: {
      fontSize: '36px',
      color: '#ff00ff',
      marginBottom: '10px',
      textShadow: '0 0 15px rgba(255, 0, 255, 0.8)'
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '40px',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '15px'
    },
    tab: {
      padding: '12px 25px',
      background: 'transparent',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    activeTab: {
      background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
      color: 'white',
      borderColor: 'transparent',
      boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))'
    },
    statNumber: {
      fontSize: '38px',
      fontWeight: 'bold',
      color: '#00ffff',
      marginBottom: '10px',
      textShadow: '0 0 15px rgba(0, 255, 255, 0.8)'
    },
    statLabel: {
      fontSize: '14px',
      color: '#ff00ff',
      textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '30px',
      borderRadius: '15px',
      marginBottom: '25px',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))'
    },
    cardTitle: {
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
    },
    lowAttendance: {
      color: '#ff0000',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
    },
    goodAttendance: {
      color: '#00ff00',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👥 STUDENT MANAGEMENT</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Attendance %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.studentId}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td style={student.attendance < 75 ? styles.lowAttendance : styles.goodAttendance}>
                      {student.attendance}%
                    </td>
                    <td>
                      <button className="btn btn-primary" style={{ marginRight: '8px' }}>
                        👁️ View
                      </button>
                      <button className="btn btn-danger">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'attendance':
        return (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 ATTENDANCE RECORDS</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.studentId}</td>
                    <td>{record.studentName}</td>
                    <td>{record.subject}</td>
                    <td>{record.date}</td>
                    <td>{record.time}</td>
                    <td style={record.status === 'Present' ? styles.statusPresent : styles.statusAbsent}>
                      {record.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'reports':
        return (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📈 GENERATE REPORTS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h3 style={{ color: '#ff00ff', marginBottom: '15px' }}>📅 Attendance Report</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.label}>Select Date Range</label>
                  <input type="date" className="form-control" />
                  <input type="date" className="form-control" style={{ marginTop: '10px' }} />
                </div>
                <button className="btn btn-primary">
                  📄 Generate Report
                </button>
              </div>
              <div>
                <h3 style={{ color: '#ff00ff', marginBottom: '15px' }}>👤 Student-wise Report</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.label}>Select Student</label>
                  <select className="form-control">
                    <option>Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary">
                  📄 Generate Report
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{students.length}</div>
                <div style={styles.statLabel}>👥 Total Students</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>156</div>
                <div style={styles.statLabel}>✅ Today's Attendance</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>87%</div>
                <div style={styles.statLabel}>📊 Overall Attendance</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>12</div>
                <div style={styles.statLabel}>⚠️ Low Attendance</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>🕒 RECENT ATTENDANCE</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.slice(0, 5).map(record => (
                      <tr key={record.id}>
                        <td>{record.studentName}</td>
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

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>⚠️ LOW ATTENDANCE ALERTS</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Attendance %</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.attendance < 75).map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td style={styles.lowAttendance}>{student.attendance}%</td>
                        <td>
                          <button className="btn btn-primary">
                            📧 Send Alert
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title} className="neon-text">⚡ ADMIN DASHBOARD</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }}>
          Welcome, {user.name} - You have full control!
        </p>
      </div>

      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'dashboard' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('dashboard')}
          onMouseEnter={(e) => !styles.activeTab && (e.target.style.borderColor = '#00ffff')}
          onMouseLeave={(e) => !styles.activeTab && (e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
        >
          📊 Dashboard
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'students' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('students')}
          onMouseEnter={(e) => !styles.activeTab && (e.target.style.borderColor = '#00ffff')}
          onMouseLeave={(e) => !styles.activeTab && (e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
        >
          👥 Students
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'attendance' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('attendance')}
          onMouseEnter={(e) => !styles.activeTab && (e.target.style.borderColor = '#00ffff')}
          onMouseLeave={(e) => !styles.activeTab && (e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
        >
          📊 Attendance
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'reports' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('reports')}
          onMouseEnter={(e) => !styles.activeTab && (e.target.style.borderColor = '#00ffff')}
          onMouseLeave={(e) => !styles.activeTab && (e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
        >
          📈 Reports
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminPanel;