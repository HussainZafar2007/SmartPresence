import React from 'react';

const Navbar = ({ user, onLogout, currentView, onViewChange }) => {
  const styles = {
    navbar: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 0',
      boxShadow: '0 0 20px rgba(255, 0, 255, 0.1)'
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    brand: {
      color: '#00ffff',
      fontSize: '28px',
      fontWeight: 'bold',
      textDecoration: 'none',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    navLink: {
      color: 'white',
      textDecoration: 'none',
      padding: '10px 20px',
      borderRadius: '25px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '2px solid transparent'
    },
    activeNavLink: {
      background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
      color: 'white',
      boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)'
    },
    userInfo: {
      color: '#00ffff',
      marginRight: '20px',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    },
    logoutBtn: {
      background: 'transparent',
      color: '#ff0000',
      border: '2px solid #ff0000',
      padding: '8px 20px',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.brand} className="neon-text">SMART ATTENDANCE</div>
        
        <div style={styles.navLinks}>
          <span style={styles.userInfo}>
            {user.name} ({user.role})
          </span>
          
          {user.role === 'admin' ? (
            <>
              <span 
                style={{
                  ...styles.navLink,
                  ...(currentView === 'admin' ? styles.activeNavLink : {})
                }}
                onClick={() => onViewChange('admin')}
              >
                📊 Admin Panel
              </span>
            </>
          ) : (
            <>
              <span 
                style={{
                  ...styles.navLink,
                  ...(currentView === 'dashboard' ? styles.activeNavLink : {})
                }}
                onClick={() => onViewChange('dashboard')}
              >
                🏠 Dashboard
              </span>
              <span 
                style={{
                  ...styles.navLink,
                  ...(currentView === 'profile' ? styles.activeNavLink : {})
                }}
                onClick={() => onViewChange('profile')}
              >
                👤 Profile
              </span>
            </>
          )}
          
          <button 
            style={styles.logoutBtn}
            onClick={onLogout}
            onMouseEnter={(e) => {
              e.target.style.background = '#ff0000';
              e.target.style.color = 'white';
              e.target.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ff0000';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;