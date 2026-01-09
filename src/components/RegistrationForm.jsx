import React, { useState, useRef, useEffect } from 'react';

const RegistrationForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [userPhoto, setUserPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (error) {
      alert('🚫 Camera access denied.');
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
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setUserPhoto(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
    setTimeout(() => setIsCapturing(false), 300);
  };

  const retakePhoto = () => {
    setUserPhoto(null);
    startCamera();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert('❌ Passwords do not match!');
    if (!userPhoto) return alert('📸 Please capture your face photo!');
    console.log('Registered:', { ...formData, userPhoto });
    alert('🎉 Account created! You can now login with your face.');
  };

  const styles = {
    // Same consistent styling as LoginForm
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', padding: '20px', fontFamily: "'Orbitron', 'Roboto', sans-serif" },
    card: { background: 'rgba(15, 15, 35, 0.6)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '680px', boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(255, 0, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.3)' },
    title: { fontSize: '38px', fontWeight: '700', background: 'linear-gradient(90deg, #00ffff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', marginBottom: '8px', letterSpacing: '4px' },
    subtitle: { textAlign: 'center', color: '#ff00ff', fontSize: '17px', marginBottom: '32px', textShadow: '0 0 10px rgba(255, 0, 255, 0.4)' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { color: '#00ffff', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textShadow: '0 0 8px rgba(0, 255, 255, 0.5)' },
    input: { padding: '14px 16px', background: 'rgba(255, 255, 255, 0.08)', border: '2px solid rgba(0, 255, 255, 0.3)', borderRadius: '12px', color: 'white', fontSize: '15px', transition: 'all 0.3s ease' },
    cameraSection: { gridColumn: '1 / -1', textAlign: 'center' },
    cameraContainer: { position: 'relative', width: '100%', height: '320px', borderRadius: '18px', overflow: 'hidden', margin: '20px 0', border: '3px solid transparent', background: 'linear-gradient(black, black) padding-box, linear-gradient(135deg, #00ffff, #ff00ff) border-box', boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)' },
    placeholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ffff', fontSize: '19px', fontWeight: '600', background: 'rgba(0, 0, 0, 0.4)' },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    capturedImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' },
    liveBadge: { position: 'absolute', top: '12px', right: '12px', background: '#ff0066', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(255, 0, 102, 0.8)', animation: 'pulse 2s infinite' },
    status: { margin: '16px 0', fontSize: '17px', color: userPhoto ? '#00ff88' : '#00ffff', fontWeight: '600', textShadow: '0 0 10px currentColor' },
    buttonGroup: { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' },
    btnPrimary: { padding: '16px 32px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, #ff00ff, #00ffff)', color: 'white', transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(255, 0, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' },
    btnSuccess: { padding: '16px 32px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, #00ff88, #00cccc)', color: 'white', transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(0, 255, 136, 0.4)' },
    btnSecondary: { padding: '16px 32px', background: 'transparent', border: '2px solid #ff00ff', color: '#ff00ff', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' },
    submitBtn: { width: '100%', padding: '18px', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, #00ff88, #00cccc)', color: 'white', marginTop: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(0, 255, 136, 0.5)', textTransform: 'uppercase', letterSpacing: '2px' },
    link: { display: 'block', textAlign: 'center', marginTop: '28px', color: '#ff00ff', fontSize: '16px', cursor: 'pointer', textDecoration: 'none', fontWeight: '500' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>REGISTER FACE ID</h1>
        <p style={styles.subtitle}>Enroll your face for secure smart login</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            {/* Form fields same as previous */}
            <div style={styles.formGroup}>
              <label style={styles.label}>👤 Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" style={styles.input} onFocus={e => e.target.style.borderColor = '#00ffff'} onBlur={e => e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>📧 Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" style={styles.input} onFocus={e => e.target.style.borderColor = '#00ffff'} onBlur={e => e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>🔒 Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={styles.input} onFocus={e => e.target.style.borderColor = '#00ffff'} onBlur={e => e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>🔐 Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" style={styles.input} onFocus={e => e.target.style.borderColor = '#00ffff'} onBlur={e => e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'} />
            </div>

            <div style={styles.cameraSection}>
              <label style={styles.label}>📸 Capture Your Face (Required)</label>
              <div style={styles.cameraContainer}>
                {!isCameraActive && !userPhoto && <div style={styles.placeholder}>🖼️ Your face will appear here</div>}
                {isCameraActive && (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
                    <div style={styles.liveBadge}>🔴 LIVE</div>
                  </>
                )}
                {userPhoto && <img src={userPhoto} alt="Your face" style={styles.capturedImg} />}
              </div>

              {isCameraActive && <div style={styles.status}>🎯 Look straight at the camera</div>}
              {userPhoto && <div style={styles.status}>✅ Face captured – ready to register!</div>}

              <div style={styles.buttonGroup}>
                {!isCameraActive && !userPhoto && (
                  <button type="button" style={styles.btnPrimary} onClick={startCamera}>
                    📷 Open Camera
                  </button>
                )}
                {isCameraActive && (
                  <>
                    <button type="button" style={{ ...styles.btnSuccess, opacity: isCapturing ? 0.7 : 1 }} onClick={capturePhoto} disabled={isCapturing}>
                      {isCapturing ? 'Capturing...' : '🌟 Capture Face'}
                    </button>
                    <button type="button" style={styles.btnSecondary} onClick={stopCamera}>Cancel</button>
                  </>
                )}
                {userPhoto && <button type="button" style={styles.btnSecondary} onClick={retakePhoto}>🔄 Retake Photo</button>}
              </div>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            🚀 Create Account
          </button>
        </form>

        <div style={styles.link} onClick={onSwitchToLogin}>
          🔐 Already registered? Login here
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  );
};

export default RegistrationForm;