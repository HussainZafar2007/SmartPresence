import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { 
  FaCamera, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHistory,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import './Attendance.css';

const API_URL = 'http://localhost:5000/api';

function Attendance({ user, onMarkAttendance }) {
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
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

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      processAttendance(imageSrc);
    }
  };

  const processAttendance = async (imageData) => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAttendanceStatus('failed');
        setErrorMessage('Please login to mark attendance');
        setIsProcessing(false);
        return;
      }

      // Convert base64 image to blob
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('face_image', blob, 'attendance.jpg');
      
      // Call API to verify face and mark attendance
      const response = await axios.post(`${API_URL}/attendance/verify-and-mark`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setAttendanceStatus('success');
        setAttendanceResult({
          name: response.data.user_name || user?.name,
          time: response.data.time,
          date: response.data.date,
          confidence: response.data.confidence,
          status: response.data.status
        });
        if (onMarkAttendance) {
          onMarkAttendance();
        }
      } else {
        setAttendanceStatus('failed');
        setErrorMessage(response.data.message || 'Face verification failed');
      }
    } catch (error) {
      console.error('Attendance error:', error);
      setAttendanceStatus('failed');
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Face verification failed. Please try again.'
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

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1><FaCamera /> Mark Attendance</h1>
        <p>Use facial recognition to mark your attendance</p>
      </div>

      <div className="attendance-content">
        <div className="camera-section card">
          <h2>Camera</h2>
          
          {!isCameraActive ? (
            <div className="camera-placeholder">
              <FaCamera className="camera-icon" />
              <p>Camera is off</p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsCameraActive(true)}
              >
                Turn On Camera
              </button>
            </div>
          ) : (
            <div className="camera-active">
              {capturedImage ? (
                <div className="captured-image">
                  <img src={capturedImage} alt="Captured" />
                  {isProcessing && (
                    <div className="processing-overlay">
                      <div className="spinner"></div>
                      <p>Processing face recognition...</p>
                    </div>
                  )}
                </div>
              ) : (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="webcam"
                />
              )}
              
              <div className="camera-controls">
                {!capturedImage ? (
                  <>
                    <button 
                      className="btn btn-capture"
                      onClick={captureImage}
                    >
                      <FaCamera /> Capture
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setIsCameraActive(false)}
                    >
                      Turn Off
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-secondary"
                    onClick={resetCapture}
                    disabled={isProcessing}
                  >
                    <FaSync /> Retake
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="status-section card">
          <h2><FaHistory /> Attendance Status</h2>
          
          {attendanceStatus === 'success' ? (
            <div className="status-success">
              <FaCheckCircle className="status-icon" />
              <h3>Attendance Marked!</h3>
              <p>Your face has been verified and attendance recorded.</p>
              <div className="status-details">
                <p><strong>Name:</strong> {attendanceResult?.name || user?.name || 'Student'}</p>
                <p><strong>Time:</strong> {attendanceResult?.time || new Date().toLocaleTimeString()}</p>
                <p><strong>Date:</strong> {attendanceResult?.date || new Date().toLocaleDateString()}</p>
                {attendanceResult?.confidence && (
                  <p><strong>Match Confidence:</strong> {attendanceResult.confidence}%</p>
                )}
                <p><strong>Status:</strong> <span className={`status-badge ${attendanceResult?.status || 'present'}`}>
                  {attendanceResult?.status?.toUpperCase() || 'PRESENT'}
                </span></p>
              </div>
              <button className="btn btn-primary" onClick={resetCapture} style={{marginTop: '1rem'}}>
                Mark Another Attendance
              </button>
            </div>
          ) : attendanceStatus === 'failed' ? (
            <div className="status-failed">
              <FaTimesCircle className="status-icon" />
              <h3>Face Verification Failed</h3>
              <div className="error-details">
                <FaExclamationTriangle className="warning-icon" />
                <p>{errorMessage || 'Your face does not match the registered face. Please try again.'}</p>
              </div>
              <button className="btn btn-primary" onClick={resetCapture} style={{marginTop: '1rem'}}>
                Try Again
              </button>
            </div>
          ) : (
            <div className="status-waiting">
              <FaCamera className="status-icon" />
              <h3>Waiting for Capture</h3>
              <p>Turn on the camera and capture your face to mark attendance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Attendance;
