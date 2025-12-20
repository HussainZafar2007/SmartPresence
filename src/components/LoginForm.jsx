import React, { useState, useRef } from 'react';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleLogin = () => {
    const user = {
      id: 1,
      name: 'Neon User',
      email: 'user@neonpresence.com',
      role: 'student'
    };
    onLogin(user);
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
      maxWidth: '500px',
      textAlign: 'center',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#00ffff',
      marginBottom: '30px',
      textShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
      letterSpacing: '2px'
    },
    cameraBox: {
      width: '100%',
      height: '300px',
      border: '3px solid #00ffff',
      borderRadius: '15px',
      margin: '25px 0',
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
      fontSize: '20px',
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
    link: {
      color: '#ff00ff',
      cursor: 'pointer',
      fontSize: '16px',
      textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
      marginTop: '25px',
      display: 'inline-block',
      transition: 'all 0.3s ease'
    },
    statusText: {
      color: '#00ffff',
      fontSize: '16px',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
      margin: '15px 0'
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
        <h1 style={styles.title}>🔮 SMART PRESENCE</h1>
        
        {/* Camera Box */}
        <div style={styles.cameraBox}>
          {!isCameraActive && !capturedImage && (
            <div style={styles.cameraPlaceholder}>
              📸 CAMERA WILL APPEAR HERE
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
          
          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Captured" 
              style={styles.capturedImage}
            />
          )}
        </div>

        {/* Status Text */}
        {isCameraActive && (
          <div style={styles.statusText}>🎥 Camera Active - Smile for the neon!</div>
        )}
        {capturedImage && (
          <div style={styles.statusText}>✅ Photo Captured Successfully!</div>
        )}

        {/* Controls */}
        <div>
          {!isCameraActive && !capturedImage && (
            <button 
              style={styles.button}
              onClick={startCamera}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🚀 Start Camera
            </button>
          )}
          
          {isCameraActive && (
            <>
              <button 
                style={styles.captureButton}
                onClick={capturePhoto}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🌟 Capture Photo
              </button>
              <button 
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
                ⚡ Stop Camera
              </button>
            </>
          )}
          
          {capturedImage && (
            <>
              <button 
                style={styles.button}
                onClick={startCamera}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔄 Take New Photo
              </button>
              <button 
                style={styles.captureButton}
                onClick={handleLogin}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🎯 Login with Photo
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: '25px' }}>
          <span 
            style={styles.link}
            onClick={onSwitchToRegister}
            onMouseEnter={(e) => e.target.style.textShadow = '0 0 15px rgba(255, 0, 255, 0.8)'}
            onMouseLeave={(e) => e.target.style.textShadow = '0 0 10px rgba(255, 0, 255, 0.5)'}
          >
            🔑 Forgot Password?
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;