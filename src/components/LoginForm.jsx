import React, { useState, useRef, useEffect } from 'react';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      alert('🚫 Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
    setTimeout(() => setIsCapturing(false), 300);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleLogin = () => {
    const mockUser = {
      id: 1,
      name: 'Neon User',
      email: 'user@smartpresence.com',
      role: 'student',
      photo: capturedImage,
    };
    onLogin(mockUser);
  };

  const styles = {
    // ... (same styles as previous improved version)
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', padding: '20px', fontFamily: "'Orbitron', 'Roboto', sans-serif" },
    card: { background: 'rgba(15, 15, 35, 0.6)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(255, 0, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.3)', textAlign: 'center' },
    title: { fontSize: '38px', fontWeight: '700', background: 'linear-gradient(90deg, #00ffff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '32px', letterSpacing: '4px', textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' },
    cameraContainer: { position: 'relative', width: '100%', height: '320px', borderRadius: '18px', overflow: 'hidden', margin: '24px 0', border: '3px solid transparent', background: 'linear-gradient(black, black) padding-box, linear-gradient(135deg, #00ffff, #ff00ff) border-box', boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)' },
    placeholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ffff', fontSize: '20px', fontWeight: '600', background: 'rgba(0, 0, 0, 0.4)' },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    capturedImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' },
    liveBadge: { position: 'absolute', top: '12px', right: '12px', background: '#ff0066', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(255, 0, 102, 0.8)', animation: 'pulse 2s infinite' },
    status: { margin: '16px 0', fontSize: '17px', color: capturedImage ? '#00ff88' : '#00ffff', fontWeight: '600', textShadow: '0 0 10px currentColor' },
    buttonGroup: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' },
    btnPrimary: { padding: '16px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, #ff00ff, #00ffff)', color: 'white', transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(255, 0, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' },
    btnSuccess: { padding: '16px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, #00ff88, #00cccc)', color: 'white', transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(0, 255, 136, 0.4)' },
    btnSecondary: { padding: '16px', background: 'transparent', border: '2px solid #ff00ff', color: '#ff00ff', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' },
    link: { marginTop: '28px', color: '#ff00ff', fontSize: '16px', cursor: 'pointer', textDecoration: 'none', fontWeight: '500' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>SMART PRESENCE</h1>

        <div style={styles.cameraContainer}>
          {!isCameraActive && !capturedImage && <div style={styles.placeholder}>📸 Ready for facial recognition</div>}
          {isCameraActive && (
            <>
              <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
              <div style={styles.liveBadge}>🔴 LIVE</div>
            </>
          )}
          {capturedImage && <img src={capturedImage} alt="Captured" style={styles.capturedImg} />}
        </div>

        {isCameraActive && <div style={styles.status}>🎯 Look at the camera and stay still...</div>}
        {capturedImage && <div style={styles.status}>✅ Face captured successfully!</div>}

        <div style={styles.buttonGroup}>
          {!isCameraActive && !capturedImage && (
            <button style={styles.btnPrimary} onClick={startCamera} onMouseEnter={e => e.target.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
              🚀 Activate Camera
            </button>
          )}

          {isCameraActive && (
            <>
              <button style={{ ...styles.btnSuccess, opacity: isCapturing ? 0.7 : 1 }} onClick={capturePhoto} disabled={isCapturing}>
                {isCapturing ? 'Capturing...' : '📸 Capture Face'}
              </button>
              <button style={styles.btnSecondary} onClick={stopCamera}>Cancel</button>
            </>
          )}

          {capturedImage && (
            <>
              <button style={styles.btnPrimary} onClick={handleLogin} onMouseEnter={e => e.target.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                🔐 Login with Face
              </button>
              <button style={styles.btnSecondary} onClick={retakePhoto}>🔄 Retake Photo</button>
            </>
          )}
        </div>

        <div style={styles.link} onClick={onSwitchToRegister}>
          🔑 Forgot Password? | Register New Face
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
};

export default LoginForm;