import React, { useState, useRef } from 'react';

const AttendanceForm = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState({
    subject: '',
    location: '',
    notes: ''
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => {
    setAttendanceData({
      ...attendanceData,
      [e.target.name]: e.target.value
    });
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("❌ Cannot access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // Capture image
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!capturedImage) {
      alert("📸 Please capture your photo first!");
      return;
    }

    // Mock attendance submission
    const attendanceRecord = {
      ...attendanceData,
      studentId: user.studentId,
      timestamp: new Date().toISOString(),
      photo: capturedImage,
      status: 'Present'
    };
    
    console.log('Attendance recorded:', attendanceRecord);
    alert('✅ Attendance marked successfully with photo!');
    
    // Reset form
    setAttendanceData({ subject: '', location: '', notes: '' });
    setCapturedImage(null);
  };

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
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
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px'
    },
    select: {
      padding: '12px 15px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer'
    },
    textarea: {
      padding: '12px 15px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical'
    },
    button: {
      padding: '15px',
      background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px'
    },
    cameraButton: {
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #00ff00 0%, #00cccc 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      margin: '5px'
    },
    secondaryButton: {
      padding: '12px 20px',
      background: 'transparent',
      border: '2px solid #ff00ff',
      color: '#ff00ff',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      margin: '5px'
    },
    cameraContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '400px',
      margin: '15px auto',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '2px solid rgba(255, 255, 255, 0.2)'
    },
    video: {
      width: '100%',
      height: '300px',
      background: '#000',
      display: 'block'
    },
    capturedImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '10px',
      border: '2px solid #00ff00',
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
    },
    cameraControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '15px',
      flexWrap: 'wrap'
    },
    photoPreview: {
      textAlign: 'center',
      margin: '15px 0'
    },
    photoLabel: {
      color: '#00ff00',
      fontWeight: 'bold',
      marginBottom: '10px',
      textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
    },
    accessButton: {
      padding: '15px 25px',
      background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      margin: '10px auto'
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>📚 Subject</label>
        <select 
          name="subject" 
          value={attendanceData.subject} 
          onChange={handleChange}
          style={styles.select}
          required
        >
          <option value="">Select Subject</option>
          <option value="Mathematics">🧮 Mathematics</option>
          <option value="Physics">⚛️ Physics</option>
          <option value="Chemistry">🧪 Chemistry</option>
          <option value="Computer Science">💻 Computer Science</option>
          <option value="English">📖 English</option>
        </select>
      </div>

      {/* Camera Section */}
      <div style={styles.formGroup}>
        <label style={styles.label}>📸 Face Verification</label>
        
        {!isCameraActive && !capturedImage && (
          <button 
            type="button"
            style={styles.accessButton}
            onClick={startCamera}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📷 Enable Camera Access
          </button>
        )}

        {isCameraActive && (
          <div>
            <div style={styles.cameraContainer}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={styles.video}
              />
            </div>
            <div style={styles.cameraControls}>
              <button 
                type="button"
                style={styles.cameraButton}
                onClick={captureImage}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📸 Capture Photo
              </button>
              <button 
                type="button"
                style={styles.secondaryButton}
                onClick={stopCamera}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff00ff';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ff00ff';
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div style={styles.photoPreview}>
            <div style={styles.photoLabel}>✅ Photo Captured Successfully!</div>
            <img 
              src={capturedImage} 
              alt="Captured attendance" 
              style={styles.capturedImage}
            />
            <div style={styles.cameraControls}>
              <button 
                type="button"
                style={styles.secondaryButton}
                onClick={retakePhoto}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff00ff';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ff00ff';
                }}
              >
                🔄 Retake Photo
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>📍 Current Location</label>
        <input
          type="text"
          value="📍 Automatically detected (Demo)"
          readOnly
          style={styles.input}
        />
        <small style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '5px' }}>
          Your location will be automatically captured
        </small>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>📝 Notes (Optional)</label>
        <textarea
          name="notes"
          value={attendanceData.notes}
          onChange={handleChange}
          placeholder="Any additional notes..."
          style={styles.textarea}
        />
      </div>

      <button 
        type="submit" 
        style={styles.button}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        disabled={!capturedImage}
      >
        {capturedImage ? '🎯 Mark Attendance with Photo' : '📸 Capture Photo First'}
      </button>

      {!capturedImage && (
        <small style={{ 
          color: '#ff00ff', 
          textAlign: 'center', 
          textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
          fontSize: '12px'
        }}>
          ⚠️ Photo capture is required for attendance verification
        </small>
      )}
    </form>
  );
};

export default AttendanceForm;