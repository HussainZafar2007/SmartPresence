import React, { useState, useRef } from 'react';

const RegistrationForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [userPhoto, setUserPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Start camera function
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('🚫 Cannot access camera. Please check permissions.');
    }
  };

  // Capture photo function
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');
    setUserPhoto(imageDataUrl);
    stopCamera();
  };

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('❌ Passwords do not match!');
      return;
    }
    
    if (!userPhoto) {
      alert('📸 Please capture your photo first!');
      return;
    }

    alert('🎉 Account created successfully!');
    console.log('User Data:', { ...formData, userPhoto });
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    form: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 0 30px rgba(255, 0, 255, 0.3)',
      width: '100%',
      maxWidth: '700px',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#00ffff',
      marginBottom: '10px',
      textAlign: 'center',
      textShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
      letterSpacing: '1px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#ff00ff',
      marginBottom: '30px',
      textAlign: 'center',
      textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '30px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      color: '#00ffff',
      marginBottom: '8px',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
      fontSize: '14px'
    },
    input: {
      padding: '12px 15px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    cameraSection: {
      gridColumn: 'span 2',
      textAlign: 'center',
      marginTop: '20px'
    },
    cameraBox: {
      width: '100%',
      height: '250px',
      border: '3px solid #00ffff',
      borderRadius: '15px',
      margin: '20px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
      position: 'relative'
    },
    cameraPlaceholder: {
      color: '#00ffff',
      fontSize: '18px',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
    },
    cameraVideo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    capturedImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      border: '3px solid #00ff00',
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.4)'
    },
    button: {
      padding: '15px 30px',
      background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '8px',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)'
    },
    captureButton: {
      padding: '15px 30px',
      background: 'linear-gradient(135deg, #00ff00 0%, #00cccc 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)'
    },
    secondaryButton: {
      padding: '15px 30px',
      background: 'transparent',
      border: '2px solid #ff00ff',
      color: '#ff00ff',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '8px',
      transition: 'all 0.3s ease',
      textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
    },
    signupButton: {
      width: '100%',
      padding: '18px',
      background: 'linear-gradient(135deg, #00ff00 0%, #00cccc 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    link: {
      color: '#ff00ff',
      cursor: 'pointer',
      fontSize: '16px',
      textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
      marginTop: '20px',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      width: '100%'
    },
    liveBadge: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'linear-gradient(135deg, #ff0000 0%, #ff00ff 100%)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h1 style={styles.title}>🚀 CREATE ACCOUNT</h1>
        
        
        <form onSubmit={handleSubmit}>
          {/* Two Column Grid */}
          <div style={styles.formGrid}>
            {/* Left Column */}
            <div style={styles.formGroup}>
              <label style={styles.label}>👤 FULL NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00ffff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            </div>

            {/* Right Column */}
            <div style={styles.formGroup}>
              <label style={styles.label}>🔑 PASSWORD</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create password"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00ffff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            </div>

            {/* Left Column */}
            <div style={styles.formGroup}>
              <label style={styles.label}>📧 EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00ffff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            </div>

            {/* Right Column */}
            <div style={styles.formGroup}>
              <label style={styles.label}>✅ CONFIRM PASSWORD</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00ffff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            </div>

            {/* Camera Section - Full Width */}
            <div style={styles.cameraSection}>
              <label style={styles.label}>📸 PROFILE PHOTO (REQUIRED)</label>
              <div style={styles.cameraBox}>
                {!isCameraActive && !userPhoto && (
                  <div style={styles.cameraPlaceholder}>
                    🖼️ YOUR PHOTO WILL APPEAR HERE
                  </div>
                )}
                
                {isCameraActive && (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      style={styles.cameraVideo}
                    />
                    <div style={styles.liveBadge}>🔴 LIVE</div>
                  </>
                )}
                
                {userPhoto && (
                  <img 
                    src={userPhoto} 
                    alt="User profile" 
                    style={styles.capturedImage}
                  />
                )}
              </div>

              <div>
                {!isCameraActive && !userPhoto && (
                  <button 
                    type="button"
                    style={styles.button}
                    onClick={startCamera}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    📷 OPEN CAMERA
                  </button>
                )}
                
                {isCameraActive && (
                  <>
                    <button 
                      type="button"
                      style={styles.captureButton}
                      onClick={capturePhoto}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      🌟 CAPTURE PHOTO
                    </button>
                    <button  
                      type="button"
                      style={styles.secondaryButton}
                      onClick={stopCamera}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ff00ff';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#ff00ff';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      ⚡ CANCEL
                    </button>
                  </>
                )}
                
                {userPhoto && (
                  <button 
                    type="button"
                    style={styles.secondaryButton}
                    onClick={startCamera}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ff00ff';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#ff00ff';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    🔄 RETAKESYNTAX
                  </button>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.signupButton}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚀 CREATE ACCOUNT
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <span 
            style={styles.link}
            onClick={onSwitchToLogin}
            onMouseEnter={(e) => e.target.style.textShadow = '0 0 15px rgba(255, 0, 255, 0.8)'}
            onMouseLeave={(e) => e.target.style.textShadow = '0 0 10px rgba(255, 0, 255, 0.5)'}
          >
            🔐 Already have an account? Login here
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;