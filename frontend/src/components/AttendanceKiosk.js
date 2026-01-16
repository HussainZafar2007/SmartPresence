import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { 
  FaCamera, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSync,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import './AttendanceKiosk.css';

const API_URL = 'http://localhost:5000/api';

function AttendanceKiosk() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const captureAndIdentify = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      identifyAndMarkAttendance(imageSrc);
    }
  };

  const identifyAndMarkAttendance = async (imageData) => {
    setIsProcessing(true);
    setErrorMessage('');
    setAttendanceStatus(null);
    
    try {
      // Convert base64 image to blob
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('face_image', blob, 'attendance.jpg');
      
      // Call API to identify face and mark attendance (no auth required)
      const response = await axios.post(`${API_URL}/attendance/kiosk-mark`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setAttendanceStatus('success');
        setAttendanceResult({
          name: response.data.user_name,
          userId: response.data.user_id,
          time: response.data.time,
          date: response.data.date,
          confidence: response.data.confidence,
          status: response.data.status,
          alreadyMarked: response.data.already_marked
        });
      } else {
        setAttendanceStatus('failed');
        setErrorMessage(response.data.message || response.data.error || 'Face not recognized');
      }
    } catch (error) {
      console.error('Attendance error:', error);
      setAttendanceStatus('failed');
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Face not recognized. Please register first.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAttendanceStatus(null);
    setAttendanceResult(null);
    setErrorMessage('');
  };

  // Auto reset after 5 seconds
  React.useEffect(() => {
    if (attendanceStatus) {
      const timer = setTimeout(() => {
        resetCapture();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [attendanceStatus]);

  return (
    <div className="kiosk-container">
      <div className="kiosk-header">
        <h1><FaUserCheck /> Smart Presence</h1>
        <p className="kiosk-subtitle">Facial Recognition Attendance System</p>
        <div className="kiosk-datetime">
          <div className="kiosk-time"><FaClock /> {currentTime}</div>
          <div className="kiosk-date">{getCurrentDate()}</div>
        </div>
      </div>

      <div className="kiosk-content">
        <div className="kiosk-camera-section">
          {capturedImage ? (
            <div className="kiosk-captured">
              <img src={capturedImage} alt="Captured" className="kiosk-captured-image" />
              {isProcessing && (
                <div className="kiosk-processing">
                  <div className="kiosk-spinner"></div>
                  <p>Identifying face...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="kiosk-webcam-container">
              {isCameraActive ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="kiosk-webcam"
                />
              ) : (
                <div className="kiosk-camera-off">
                  <FaCamera className="camera-icon" />
                  <p>Camera is off</p>
                </div>
              )}
              <div className="kiosk-face-guide">
                <div className="face-oval"></div>
                <p>Position your face in the oval</p>
              </div>
            </div>
          )}

          {!attendanceStatus && !isProcessing && (
            <button 
              className="kiosk-capture-btn"
              onClick={captureAndIdentify}
              disabled={!isCameraActive}
            >
              <FaCamera /> Mark My Attendance
            </button>
          )}
        </div>

        <div className="kiosk-status-section">
          {attendanceStatus === 'success' ? (
            <div className="kiosk-status-success">
              <FaCheckCircle className="status-icon success" />
              <h2>Attendance Marked!</h2>
              <div className="kiosk-user-info">
                <p className="user-name">{attendanceResult?.name}</p>
                <p className="user-id">ID: {attendanceResult?.userId}</p>
              </div>
              <div className="kiosk-attendance-details">
                <p><strong>Time:</strong> {attendanceResult?.time}</p>
                <p><strong>Date:</strong> {attendanceResult?.date}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${attendanceResult?.status}`}>
                    {attendanceResult?.status?.toUpperCase()}
                  </span>
                </p>
                {attendanceResult?.alreadyMarked && (
                  <p className="already-marked">
                    (Attendance was already recorded today)
                  </p>
                )}
              </div>
              <div className="kiosk-action-buttons">
                <button className="kiosk-login-btn" onClick={() => navigate('/login')}>
                  <FaSignInAlt /> Go to Dashboard
                </button>
              </div>
              <p className="auto-reset">Resetting in 5 seconds...</p>
            </div>
          ) : attendanceStatus === 'failed' ? (
            <div className="kiosk-status-failed">
              <FaUserTimes className="status-icon failed" />
              <h2>Not Recognized</h2>
              <p className="error-message">{errorMessage}</p>
              <p className="register-hint">
                If you haven't registered, please register first with your face photo.
              </p>
              <div className="kiosk-action-buttons">
                <button className="kiosk-retry-btn" onClick={resetCapture}>
                  <FaSync /> Try Again
                </button>
                <button className="kiosk-register-btn" onClick={() => navigate('/register')}>
                  <FaUserPlus /> Register
                </button>
              </div>
            </div>
          ) : (
            <div className="kiosk-instructions">
              <h2>How to Mark Attendance</h2>
              <ol>
                <li>Stand in front of the camera</li>
                <li>Position your face in the oval guide</li>
                <li>Click "Mark My Attendance"</li>
                <li>Wait for face recognition</li>
              </ol>
              <div className="kiosk-note">
                <p><strong>Note:</strong> You must be registered to mark attendance.</p>
              </div>
              <div className="kiosk-nav-buttons">
                <button className="kiosk-login-btn" onClick={() => navigate('/login')}>
                  <FaSignInAlt /> Login to Dashboard
                </button>
                <button className="kiosk-register-btn" onClick={() => navigate('/register')}>
                  <FaUserPlus /> New User? Register
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="kiosk-footer">
        <p>Smart Presence System © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default AttendanceKiosk;
