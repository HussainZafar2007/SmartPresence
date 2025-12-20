import React, { useState } from 'react';

const StudentProfile = ({ user }) => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: user.email,
    phone: '+1234567890',
    studentId: user.studentId,
    department: 'Computer Science',
    semester: '5th',
    dateOfBirth: '2000-01-01'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('✅ Profile updated successfully! (Demo)');
  };

  const styles = {
    container: {
      padding: '30px 20px',
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '36px',
      color: '#ff00ff',
      textShadow: '0 0 15px rgba(255, 0, 255, 0.8)'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '40px',
      borderRadius: '20px',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '25px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '8px',
      fontWeight: '600',
      color: '#00ffff',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    },
    input: {
      padding: '12px 15px',
      border: isEditing ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      fontSize: '14px',
      background: isEditing ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      cursor: isEditing ? 'text' : 'not-allowed'
    },
    buttonGroup: {
      gridColumn: 'span 2',
      display: 'flex',
      gap: '15px',
      justifyContent: 'flex-end',
      marginTop: '30px'
    },
    button: {
      padding: '12px 25px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    editButton: {
      background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
      color: 'white'
    },
    saveButton: {
      background: 'linear-gradient(135deg, #00ff00 0%, #00cccc 100%)',
      color: 'white'
    },
    cancelButton: {
      background: 'linear-gradient(135deg, #ff0000 0%, #ff00ff 100%)',
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title} className="neon-text">👤 STUDENT PROFILE</h1>
        {!isEditing && (
          <button 
            style={{...styles.button, ...styles.editButton}}
            onClick={() => setIsEditing(true)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>👤 First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>👤 Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📧 Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📱 Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🎓 Student ID</label>
              <input
                type="text"
                name="studentId"
                value={profile.studentId}
                disabled
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🏫 Department</label>
              <input
                type="text"
                name="department"
                value={profile.department}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📚 Semester</label>
              <input
                type="text"
                name="semester"
                value={profile.semester}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🎂 Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                style={styles.input}
              />
            </div>

            {isEditing && (
              <div style={styles.buttonGroup}>
                <button 
                  type="button"
                  style={{...styles.button, ...styles.cancelButton}}
                  onClick={() => setIsEditing(false)}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ❌ Cancel
                </button>
                <button 
                  type="submit"
                  style={{...styles.button, ...styles.saveButton}}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  💾 Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;