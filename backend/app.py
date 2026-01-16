"""
Smart Presence System - Backend API Server
Built with Flask (Python)
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
import json
import bcrypt
import jwt
import datetime
from functools import wraps
import cv2
import numpy as np

# Try to import face_recognition, but don't fail if models aren't installed
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except SystemExit:
    face_recognition = None
    FACE_RECOGNITION_AVAILABLE = False
    print("WARNING: face_recognition models not installed. Face recognition features will be disabled.")
    print("To enable, run: pip install git+https://github.com/ageitgey/face_recognition_models")

from werkzeug.utils import secure_filename
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})  # Enable CORS for all routes

# Configuration
app.config['SECRET_KEY'] = 'smart-presence-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['DATABASE_CONFIG'] = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root123',  # Change this to your MySQL password
    'database': 'smart_presence_db',
    'port': 3306
}

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database connection helper
def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**app.config['DATABASE_CONFIG'])
        logger.info("Database connection established")
        return connection
    except Error as e:
        logger.error(f"Error connecting to MySQL: {e}")
        return None

# Initialize database tables
def init_database():
    """Initialize database with required tables"""
    connection = get_db_connection()
    if not connection:
        logger.error("Failed to connect to database for initialization")
        return False
    
    try:
        cursor = connection.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
                department VARCHAR(100),
                semester VARCHAR(20),
                phone VARCHAR(20),
                profile_image TEXT,
                face_encoding TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_email (email),
                INDEX idx_role (role)
            )
        """)
        
        # Create attendance table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                status ENUM('present', 'absent', 'late') DEFAULT 'present',
                subject VARCHAR(100),
                faculty VARCHAR(100),
                room VARCHAR(50),
                confidence_score FLOAT,
                face_image_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_date (user_id, date),
                INDEX idx_date (date),
                INDEX idx_status (status)
            )
        """)
        
        # Create subjects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_code VARCHAR(50) UNIQUE NOT NULL,
                subject_name VARCHAR(100) NOT NULL,
                department VARCHAR(100),
                semester VARCHAR(20),
                faculty_id VARCHAR(50),
                schedule_time TIME,
                schedule_day VARCHAR(20),
                room VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create departments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                department_code VARCHAR(50) UNIQUE NOT NULL,
                department_name VARCHAR(100) NOT NULL,
                head_of_department VARCHAR(100),
                total_students INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create face_encodings table for faster recognition
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS face_encodings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) UNIQUE NOT NULL,
                face_encoding BLOB,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        """)
        
        connection.commit()
        logger.info("Database tables initialized successfully")
        return True
        
    except Error as e:
        logger.error(f"Error initializing database: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# JWT Token helper functions
def generate_token(user_id, role):
    """Generate JWT token for authenticated user"""
    try:
        payload = {
            'user_id': user_id,
            'role': role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
        return token
    except Exception as e:
        logger.error(f"Error generating token: {e}")
        return None

def verify_token(token):
    """Verify JWT token and return payload if valid"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None

# Authentication decorator
def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.user_id = payload['user_id']
        request.user_role = payload['role']
        
        return f(*args, **kwargs)
    
    return decorated

# Role-based access control decorator
def role_required(roles):
    """Decorator to restrict access based on user role"""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.user_role not in roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

# File upload helper
def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Face recognition helper
def encode_face(image_path):
    """Encode face from image for recognition"""
    try:
        # Load image
        image = face_recognition.load_image_file(image_path)
        
        # Find face locations
        face_locations = face_recognition.face_locations(image)
        
        if not face_locations:
            return None
        
        # Encode the first face found
        face_encoding = face_recognition.face_encodings(image, face_locations)[0]
        
        # Convert to list for JSON serialization
        encoding_list = face_encoding.tolist()
        
        return encoding_list
    except Exception as e:
        logger.error(f"Error encoding face: {e}")
        return None

def recognize_face(image_path):
    """Recognize face from image and return user details"""
    try:
        # Load unknown face
        unknown_image = face_recognition.load_image_file(image_path)
        unknown_encoding = face_recognition.face_encodings(unknown_image)
        
        if not unknown_encoding:
            return None
        
        unknown_encoding = unknown_encoding[0]
        
        # Get all known face encodings from database
        connection = get_db_connection()
        if not connection:
            return None
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT u.user_id, u.name, fe.face_encoding FROM users u JOIN face_encodings fe ON u.user_id = fe.user_id")
        known_faces = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        if not known_faces:
            return None
        
        # Compare with known faces
        for face in known_faces:
            # Convert BLOB to numpy array
            known_encoding = np.frombuffer(face['face_encoding'], dtype=np.float64)
            
            # Compare faces
            matches = face_recognition.compare_faces([known_encoding], unknown_encoding)
            face_distance = face_recognition.face_distance([known_encoding], unknown_encoding)
            
            if matches[0]:
                confidence = (1 - face_distance[0]) * 100
                if confidence > 70:  # Minimum confidence threshold
                    return {
                        'user_id': face['user_id'],
                        'name': face['name'],
                        'confidence': round(confidence, 2)
                    }
        
        return None
    except Exception as e:
        logger.error(f"Error recognizing face: {e}")
        return None

# ==================== API ROUTES ====================

@app.route('/')
def index():
    """Home route - API information"""
    return jsonify({
        'message': 'Smart Presence System API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'login': 'POST /api/auth/login',
                'register': 'POST /api/auth/register',
                'logout': 'POST /api/auth/logout'
            },
            'attendance': {
                'mark': 'POST /api/attendance/mark',
                'history': 'GET /api/attendance/history',
                'today': 'GET /api/attendance/today'
            },
            'users': {
                'profile': 'GET /api/users/profile',
                'update': 'PUT /api/users/update'
            },
            'admin': {
                'all_users': 'GET /api/admin/users',
                'all_attendance': 'GET /api/admin/attendance'
            }
        }
    })

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            cursor.close()
            connection.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user['user_id'], user['role'])
        
        # Update user data without sensitive info
        user_data = {
            'user_id': user['user_id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'department': user['department'],
            'semester': user['semester'],
            'phone': user['phone']
        }
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_data
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.form.to_dict()
        files = request.files
        
        # Extract user data
        user_id = data.get('user_id')
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        department = data.get('department')
        semester = data.get('semester')
        phone = data.get('phone')
        
        # Validation
        if not all([user_id, name, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s OR user_id = %s", (email, user_id))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'User already exists with this email or ID'}), 400
        
        # Handle face image - this is required and used for both profile and face verification
        profile_image_path = None
        if 'face_image' in files:
            file = files['face_image']
            if file and allowed_file(file.filename):
                filename = secure_filename(f"{user_id}_face.jpg")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                profile_image_path = file_path
                logger.info(f"Face image saved for user {user_id}: {file_path}")
        elif 'profile_image' in files:
            file = files['profile_image']
            if file and allowed_file(file.filename):
                filename = secure_filename(f"{user_id}_{file.filename}")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                profile_image_path = file_path
        
        if not profile_image_path:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Face image is required for registration'}), 400
        
        # Insert user with face image as profile_image
        cursor.execute("""
            INSERT INTO users (user_id, name, email, password, role, department, semester, phone, profile_image)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, name, email, hashed_password, role, department, semester, phone, profile_image_path))
        
        # Also try to encode face if face_recognition is available
        if FACE_RECOGNITION_AVAILABLE and face_recognition is not None:
            try:
                face_encoding = encode_face(profile_image_path)
                if face_encoding:
                    encoding_blob = np.array(face_encoding, dtype=np.float64).tobytes()
                    cursor.execute("""
                        INSERT INTO face_encodings (user_id, face_encoding)
                        VALUES (%s, %s)
                    """, (user_id, encoding_blob))
                    logger.info(f"Face encoding saved for user {user_id}")
            except Exception as e:
                logger.warning(f"Could not encode face for user {user_id}: {e}")
        
        connection.commit()
        
        # Generate token
        token = generate_token(user_id, role)
        
        user_data = {
            'user_id': user_id,
            'name': name,
            'email': email,
            'role': role,
            'department': department,
            'semester': semester,
            'phone': phone
        }
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': user_data
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """User logout endpoint"""
    # In JWT, logout is handled client-side by removing the token
    return jsonify({'message': 'Logout successful'}), 200

# ==================== ATTENDANCE ROUTES ====================

@app.route('/api/attendance/mark', methods=['POST'])
@token_required
def mark_attendance():
    """Mark attendance using face recognition"""
    try:
        if 'face_image' not in request.files:
            return jsonify({'error': 'No face image provided'}), 400
        
        file = request.files['face_image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Save the uploaded image
            filename = secure_filename(f"attendance_{request.user_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Recognize face
            recognition_result = recognize_face(file_path)
            
            if not recognition_result:
                return jsonify({'error': 'Face not recognized'}), 400
            
            # Verify it's the same user
            if recognition_result['user_id'] != request.user_id:
                return jsonify({'error': 'Face does not match registered user'}), 400
            
            # Get additional data
            data = request.form
            subject = data.get('subject')
            faculty = data.get('faculty')
            room = data.get('room')
            
            # Determine status based on current time
            current_time = datetime.datetime.now().time()
            late_threshold = datetime.time(9, 30)  # 9:30 AM
            
            if current_time > late_threshold:
                status = 'late'
            else:
                status = 'present'
            
            # Save attendance record
            connection = get_db_connection()
            if not connection:
                return jsonify({'error': 'Database connection failed'}), 500
            
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO attendance (user_id, date, time, status, subject, faculty, room, confidence_score, face_image_path)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                request.user_id,
                datetime.date.today(),
                current_time,
                status,
                subject,
                faculty,
                room,
                recognition_result['confidence'],
                file_path
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({
                'message': 'Attendance marked successfully',
                'status': status,
                'confidence': recognition_result['confidence'],
                'time': current_time.strftime('%H:%M:%S'),
                'date': datetime.date.today().isoformat()
            }), 200
        
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        logger.error(f"Attendance marking error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/attendance/verify-and-mark', methods=['POST'])
@token_required
def verify_and_mark_attendance():
    """Verify face and mark attendance - simplified version using image comparison"""
    try:
        if 'face_image' not in request.files:
            return jsonify({'error': 'No face image provided', 'success': False}), 400
        
        file = request.files['face_image']
        if file.filename == '':
            return jsonify({'error': 'No selected file', 'success': False}), 400
        
        if file and allowed_file(file.filename):
            # Save the uploaded attendance image
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = secure_filename(f"attendance_{request.user_id}_{timestamp}.jpg")
            attendance_image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(attendance_image_path)
            
            # Get user's registered face image from database
            connection = get_db_connection()
            if not connection:
                return jsonify({'error': 'Database connection failed', 'success': False}), 500
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT user_id, name, profile_image FROM users WHERE user_id = %s
            """, (request.user_id,))
            user = cursor.fetchone()
            
            if not user:
                cursor.close()
                connection.close()
                return jsonify({'error': 'User not found', 'success': False}), 404
            
            registered_face_path = user['profile_image']
            
            if not registered_face_path or not os.path.exists(registered_face_path):
                cursor.close()
                connection.close()
                return jsonify({
                    'error': 'No registered face image found. Please register with face capture first.',
                    'success': False
                }), 400
            
            # Perform face verification
            verification_result = verify_faces(registered_face_path, attendance_image_path)
            
            # Require minimum 50% confidence for a valid match (like working code)
            MIN_CONFIDENCE_FOR_MATCH = 50
            
            if not verification_result['match'] or verification_result.get('confidence', 0) < MIN_CONFIDENCE_FOR_MATCH:
                cursor.close()
                connection.close()
                # Remove the attendance image if verification failed
                if os.path.exists(attendance_image_path):
                    os.remove(attendance_image_path)
                confidence = verification_result.get('confidence', 0)
                logger.warning(f"Face verification failed for user {request.user_id}. Confidence: {confidence}%")
                return jsonify({
                    'error': 'Face verification failed. The captured face does not match your registered face.',
                    'message': f'Face match confidence ({confidence}%) is below the required threshold. Please ensure good lighting and face the camera directly.',
                    'success': False
                }), 400
            
            # Face matched - mark attendance
            current_time = datetime.datetime.now().time()
            current_date = datetime.date.today()
            late_threshold = datetime.time(9, 30)  # 9:30 AM
            
            status = 'late' if current_time > late_threshold else 'present'
            
            # Check if attendance already marked today
            cursor.execute("""
                SELECT id FROM attendance WHERE user_id = %s AND date = %s
            """, (request.user_id, current_date))
            existing = cursor.fetchone()
            
            if existing:
                cursor.close()
                connection.close()
                return jsonify({
                    'success': True,
                    'message': 'Attendance already marked for today',
                    'user_name': user['name'],
                    'time': current_time.strftime('%H:%M:%S'),
                    'date': current_date.isoformat(),
                    'confidence': verification_result['confidence'],
                    'status': status,
                    'already_marked': True
                }), 200
            
            # Insert attendance record
            cursor.execute("""
                INSERT INTO attendance (user_id, date, time, status, confidence_score, face_image_path)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                request.user_id,
                current_date,
                current_time,
                status,
                verification_result['confidence'],
                attendance_image_path
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({
                'success': True,
                'message': 'Attendance marked successfully',
                'user_name': user['name'],
                'time': current_time.strftime('%H:%M:%S'),
                'date': current_date.isoformat(),
                'confidence': verification_result['confidence'],
                'status': status
            }), 200
        
        return jsonify({'error': 'Invalid file type', 'success': False}), 400
        
    except Exception as e:
        logger.error(f"Face verification error: {e}")
        return jsonify({'error': 'Internal server error', 'success': False}), 500

@app.route('/api/attendance/kiosk-mark', methods=['POST'])
def kiosk_mark_attendance():
    """
    Public kiosk endpoint - Identify user by face and mark attendance.
    No authentication required - the face IS the authentication.
    """
    try:
        if 'face_image' not in request.files:
            return jsonify({'error': 'No face image provided', 'success': False}), 400
        
        file = request.files['face_image']
        if file.filename == '':
            return jsonify({'error': 'No selected file', 'success': False}), 400
        
        if file and allowed_file(file.filename):
            # Save the uploaded attendance image temporarily
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = secure_filename(f"kiosk_temp_{timestamp}.jpg")
            attendance_image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(attendance_image_path)
            
            # Get ALL registered users with face images
            connection = get_db_connection()
            if not connection:
                return jsonify({'error': 'Database connection failed', 'success': False}), 500
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT user_id, name, email, department, profile_image 
                FROM users 
                WHERE profile_image IS NOT NULL
            """)
            all_users = cursor.fetchall()
            
            if not all_users:
                cursor.close()
                connection.close()
                if os.path.exists(attendance_image_path):
                    os.remove(attendance_image_path)
                return jsonify({
                    'error': 'No registered users found in the system',
                    'success': False
                }), 404
            
            # Try to match the face against all registered users
            matched_user = None
            best_confidence = 0
            best_distance = float('inf')
            
            # MINIMUM CONFIDENCE REQUIRED - lowered for better matching
            # Like the working code uses CONFIDENCE_THRESHOLD = 60 for distance
            MIN_CONFIDENCE_THRESHOLD = 30  # Must be at least 30% confident (more lenient)
            
            for user in all_users:
                registered_face_path = user['profile_image']
                
                if not registered_face_path or not os.path.exists(registered_face_path):
                    continue
                
                # Verify face against this user
                verification_result = verify_faces(registered_face_path, attendance_image_path)
                
                if verification_result['match']:
                    current_confidence = verification_result.get('confidence', 0)
                    current_distance = verification_result.get('distance', 100)
                    
                    # Only accept if confidence is above threshold
                    if current_confidence >= MIN_CONFIDENCE_THRESHOLD:
                        # Choose the best match (highest confidence / lowest distance)
                        if current_distance < best_distance:
                            matched_user = user
                            best_confidence = current_confidence
                            best_distance = current_distance
                            logger.info(f"Potential match: {user['name']} with confidence {current_confidence}% (distance: {current_distance})")
            
            if not matched_user:
                cursor.close()
                connection.close()
                # Remove temp image
                if os.path.exists(attendance_image_path):
                    os.remove(attendance_image_path)
                logger.warning(f"Face verification failed - no match found above {MIN_CONFIDENCE_THRESHOLD}% confidence")
                return jsonify({
                    'error': 'Face not recognized with sufficient confidence.',
                    'message': 'Please ensure good lighting, face the camera directly, and try again. If you are not registered, please register first.',
                    'success': False
                }), 400
            
            logger.info(f"Face matched successfully: {matched_user['name']} with {best_confidence}% confidence")
            
            # Convert numpy types to Python types for JSON serialization
            best_confidence = float(best_confidence)
            best_distance = float(best_distance)
            
            # Face matched! Rename the temp file with user ID
            new_filename = secure_filename(f"attendance_{matched_user['user_id']}_{timestamp}.jpg")
            new_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
            os.rename(attendance_image_path, new_path)
            attendance_image_path = new_path
            
            # Mark attendance for matched user
            current_time = datetime.datetime.now().time()
            current_date = datetime.date.today()
            late_threshold = datetime.time(9, 30)  # 9:30 AM
            
            status = 'late' if current_time > late_threshold else 'present'
            
            # Check if attendance already marked today
            cursor.execute("""
                SELECT id FROM attendance WHERE user_id = %s AND date = %s
            """, (matched_user['user_id'], current_date))
            existing = cursor.fetchone()
            
            if existing:
                cursor.close()
                connection.close()
                return jsonify({
                    'success': True,
                    'message': 'Attendance already marked for today',
                    'user_id': matched_user['user_id'],
                    'user_name': matched_user['name'],
                    'department': matched_user['department'],
                    'time': current_time.strftime('%H:%M:%S'),
                    'date': current_date.isoformat(),
                    'confidence': best_confidence,
                    'status': status,
                    'already_marked': True
                }), 200
            
            # Insert new attendance record
            cursor.execute("""
                INSERT INTO attendance (user_id, date, time, status, confidence_score, face_image_path)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                matched_user['user_id'],
                current_date,
                current_time,
                status,
                best_confidence,
                attendance_image_path
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            logger.info(f"Kiosk attendance marked for user: {matched_user['user_id']} ({matched_user['name']})")
            
            return jsonify({
                'success': True,
                'message': 'Attendance marked successfully',
                'user_id': matched_user['user_id'],
                'user_name': matched_user['name'],
                'department': matched_user['department'],
                'time': current_time.strftime('%H:%M:%S'),
                'date': current_date.isoformat(),
                'confidence': best_confidence,
                'status': status,
                'already_marked': False
            }), 200
        
        return jsonify({'error': 'Invalid file type', 'success': False}), 400
        
    except Exception as e:
        logger.error(f"Kiosk attendance error: {e}")
        return jsonify({'error': 'Internal server error', 'success': False}), 500

def verify_faces(registered_image_path, attendance_image_path):
    """
    Verify if two face images match.
    Uses face_recognition library if available, otherwise falls back to OpenCV comparison.
    """
    try:
        if FACE_RECOGNITION_AVAILABLE and face_recognition is not None:
            # Use face_recognition library for accurate matching
            registered_image = face_recognition.load_image_file(registered_image_path)
            attendance_image = face_recognition.load_image_file(attendance_image_path)
            
            registered_encodings = face_recognition.face_encodings(registered_image)
            attendance_encodings = face_recognition.face_encodings(attendance_image)
            
            if not registered_encodings or not attendance_encodings:
                return {'match': False, 'confidence': 0, 'error': 'No face detected in one or both images'}
            
            # Compare faces
            matches = face_recognition.compare_faces([registered_encodings[0]], attendance_encodings[0])
            face_distance = face_recognition.face_distance([registered_encodings[0]], attendance_encodings[0])
            
            confidence = round((1 - face_distance[0]) * 100, 2)
            
            if matches[0] and confidence >= 60:
                return {'match': True, 'confidence': confidence}
            else:
                return {'match': False, 'confidence': confidence}
        else:
            # Fallback: Use OpenCV for basic face detection and histogram comparison
            return verify_faces_opencv(registered_image_path, attendance_image_path)
            
    except Exception as e:
        logger.error(f"Face verification error: {e}")
        return {'match': False, 'confidence': 0, 'error': str(e)}

def verify_faces_opencv(registered_image_path, attendance_image_path):
    """
    Face verification using OpenCV histogram comparison and template matching.
    Simple but effective for face matching.
    """
    try:
        # Load images
        registered_img = cv2.imread(registered_image_path)
        attendance_img = cv2.imread(attendance_image_path)
        
        if registered_img is None or attendance_img is None:
            return {'match': False, 'confidence': 0, 'error': 'Could not load images'}
        
        # Load face cascade classifier
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        
        # Also try alternate cascade for better detection
        alt_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
        alt_cascade = cv2.CascadeClassifier(alt_cascade_path)
        
        # Convert to grayscale
        gray_registered = cv2.cvtColor(registered_img, cv2.COLOR_BGR2GRAY)
        gray_attendance = cv2.cvtColor(attendance_img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces with flexible parameters
        faces_registered = face_cascade.detectMultiScale(
            gray_registered, 
            scaleFactor=1.1, 
            minNeighbors=3,
            minSize=(30, 30)
        )
        
        # Try alternate cascade if no face found
        if len(faces_registered) == 0:
            faces_registered = alt_cascade.detectMultiScale(
                gray_registered, 
                scaleFactor=1.05, 
                minNeighbors=2,
                minSize=(20, 20)
            )
        
        faces_attendance = face_cascade.detectMultiScale(
            gray_attendance, 
            scaleFactor=1.1, 
            minNeighbors=3,
            minSize=(30, 30)
        )
        
        # Try alternate cascade if no face found
        if len(faces_attendance) == 0:
            faces_attendance = alt_cascade.detectMultiScale(
                gray_attendance, 
                scaleFactor=1.05, 
                minNeighbors=2,
                minSize=(20, 20)
            )
        
        if len(faces_registered) == 0:
            logger.warning("No face detected in registered image")
            return {'match': False, 'confidence': 0, 'error': 'No face detected in registered image.'}
        if len(faces_attendance) == 0:
            logger.warning("No face detected in captured image")
            return {'match': False, 'confidence': 0, 'error': 'No face detected. Please ensure good lighting.'}
        
        # Extract face regions
        (x1, y1, w1, h1) = faces_registered[0]
        (x2, y2, w2, h2) = faces_attendance[0]
        
        face_registered = gray_registered[y1:y1+h1, x1:x1+w1]
        face_attendance = gray_attendance[y2:y2+h2, x2:x2+w2]
        
        # Resize to same dimensions
        target_size = (150, 150)
        face_registered = cv2.resize(face_registered, target_size)
        face_attendance = cv2.resize(face_attendance, target_size)
        
        # Apply histogram equalization for better comparison
        face_registered = cv2.equalizeHist(face_registered)
        face_attendance = cv2.equalizeHist(face_attendance)
        
        # Method 1: Histogram Comparison
        hist_registered = cv2.calcHist([face_registered], [0], None, [256], [0, 256])
        hist_attendance = cv2.calcHist([face_attendance], [0], None, [256], [0, 256])
        
        # Normalize histograms
        cv2.normalize(hist_registered, hist_registered, 0, 1, cv2.NORM_MINMAX)
        cv2.normalize(hist_attendance, hist_attendance, 0, 1, cv2.NORM_MINMAX)
        
        # Compare using correlation (higher is better, max 1.0)
        hist_score = cv2.compareHist(hist_registered, hist_attendance, cv2.HISTCMP_CORREL)
        
        # Method 2: Template Matching
        result = cv2.matchTemplate(face_attendance, face_registered, cv2.TM_CCOEFF_NORMED)
        template_score = result[0][0] if result.size > 0 else 0
        
        # Method 3: Structural comparison using normalized cross-correlation
        norm_registered = face_registered.astype(np.float32) / 255.0
        norm_attendance = face_attendance.astype(np.float32) / 255.0
        
        # Calculate mean-normalized correlation
        mean_reg = np.mean(norm_registered)
        mean_att = np.mean(norm_attendance)
        
        numerator = np.sum((norm_registered - mean_reg) * (norm_attendance - mean_att))
        denominator = np.sqrt(np.sum((norm_registered - mean_reg)**2) * np.sum((norm_attendance - mean_att)**2))
        
        if denominator > 0:
            ncc_score = numerator / denominator
        else:
            ncc_score = 0
        
        # Combine scores with weights
        # Histogram: 30%, Template: 30%, NCC: 40%
        combined_score = (hist_score * 0.3) + (max(0, template_score) * 0.3) + (max(0, ncc_score) * 0.4)
        
        # Convert to confidence percentage (0-100)
        confidence = round(combined_score * 100, 2)
        confidence = max(0, min(100, confidence))  # Clamp to 0-100
        
        logger.info(f"Face Verification - Hist: {hist_score:.3f}, Template: {template_score:.3f}, NCC: {ncc_score:.3f}, Combined: {confidence}%")
        
        # Threshold for match (40% is reasonable for this method)
        match_threshold = 40
        
        if confidence >= match_threshold:
            return {'match': True, 'confidence': confidence, 'distance': 100 - confidence}
        else:
            return {
                'match': False, 
                'confidence': confidence, 
                'distance': 100 - confidence,
                'error': 'Face does not match with sufficient confidence.'
            }
            
    except Exception as e:
        logger.error(f"Face verification error: {e}")
        return {'match': False, 'confidence': 0, 'error': str(e)}

def verify_faces_ssim(registered_image_path, attendance_image_path):
    """
    Fallback verification using Structural Similarity Index (SSIM).
    More strict than histogram comparison.
    """
    try:
        from skimage.metrics import structural_similarity as ssim
        
        # Load images
        registered_img = cv2.imread(registered_image_path)
        attendance_img = cv2.imread(attendance_image_path)
        
        if registered_img is None or attendance_img is None:
            return {'match': False, 'confidence': 0, 'error': 'Could not load images'}
        
        # Load face cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale
        gray_registered = cv2.cvtColor(registered_img, cv2.COLOR_BGR2GRAY)
        gray_attendance = cv2.cvtColor(attendance_img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces_registered = face_cascade.detectMultiScale(gray_registered, 1.1, 5, minSize=(80, 80))
        faces_attendance = face_cascade.detectMultiScale(gray_attendance, 1.1, 5, minSize=(80, 80))
        
        if len(faces_registered) == 0 or len(faces_attendance) == 0:
            return {'match': False, 'confidence': 0, 'error': 'No face detected'}
        
        # Extract and resize faces
        (x1, y1, w1, h1) = faces_registered[0]
        (x2, y2, w2, h2) = faces_attendance[0]
        
        face_registered = gray_registered[y1:y1+h1, x1:x1+w1]
        face_attendance = gray_attendance[y2:y2+h2, x2:x2+w2]
        
        face_registered = cv2.resize(face_registered, (200, 200))
        face_attendance = cv2.resize(face_attendance, (200, 200))
        
        # Calculate SSIM
        similarity = ssim(face_registered, face_attendance)
        confidence = round(similarity * 100, 2)
        
        logger.info(f"SSIM Face Comparison - Similarity: {similarity}, Confidence: {confidence}%")
        
        # SSIM threshold for face matching (strict)
        if similarity >= 0.45:  # 45% similarity required
            return {'match': True, 'confidence': confidence}
        else:
            return {'match': False, 'confidence': confidence, 'error': 'Face does not match registered user'}
            
    except ImportError:
        logger.warning("skimage not available, using basic comparison")
        return {'match': False, 'confidence': 0, 'error': 'Face verification temporarily unavailable'}
    except Exception as e:
        logger.error(f"SSIM verification error: {e}")
        return {'match': False, 'confidence': 0, 'error': str(e)}

@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get dashboard statistics for the logged-in user"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        user_id = request.user_id
        
        # Get total attendance records
        cursor.execute("""
            SELECT 
                COUNT(*) as total_attendance,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
            FROM attendance 
            WHERE user_id = %s
        """, (user_id,))
        
        stats = cursor.fetchone()
        
        total = stats['total_attendance'] or 0
        present = stats['present_days'] or 0
        absent = stats['absent_days'] or 0
        late = stats['late_days'] or 0
        
        # Calculate percentage
        attendance_percentage = round((present / total * 100), 1) if total > 0 else 0
        
        # Get recent attendance records (only select existing columns)
        cursor.execute("""
            SELECT id, date, time, status, subject 
            FROM attendance 
            WHERE user_id = %s 
            ORDER BY date DESC, time DESC 
            LIMIT 10
        """, (user_id,))
        
        recent_records = cursor.fetchall()
        
        # Format for JSON
        for record in recent_records:
            if record['date']:
                record['date'] = record['date'].isoformat()
            if record['time']:
                record['time'] = str(record['time'])
        
        # Get monthly attendance data for charts
        cursor.execute("""
            SELECT 
                DATE_FORMAT(date, '%%Y-%%m') as month,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
            FROM attendance 
            WHERE user_id = %s 
            GROUP BY DATE_FORMAT(date, '%%Y-%%m')
            ORDER BY month DESC
            LIMIT 6
        """, (user_id,))
        
        monthly_data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'stats': {
                'totalAttendance': total,
                'presentDays': present,
                'absentDays': absent,
                'lateDays': late,
                'attendancePercentage': attendance_percentage
            },
            'recentAttendance': recent_records,
            'monthlyData': monthly_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/attendance/history', methods=['GET'])
@token_required
def get_attendance_history():
    """Get attendance history for a user"""
    try:
        user_id = request.args.get('user_id', request.user_id)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Build query based on parameters
        query = "SELECT * FROM attendance WHERE user_id = %s"
        params = [user_id]
        
        if start_date:
            query += " AND date >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND date <= %s"
            params.append(end_date)
        
        query += " ORDER BY date DESC, time DESC LIMIT 100"
        
        cursor.execute(query, tuple(params))
        attendance_records = cursor.fetchall()
        
        # Format dates for JSON serialization
        for record in attendance_records:
            if 'date' in record and record['date']:
                record['date'] = record['date'].isoformat()
            if 'time' in record and record['time']:
                record['time'] = str(record['time'])
            if 'created_at' in record and record['created_at']:
                record['created_at'] = record['created_at'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'count': len(attendance_records),
            'records': attendance_records
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting attendance history: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/attendance/today', methods=['GET'])
@token_required
def get_today_attendance():
    """Get today's attendance for a user"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM attendance 
            WHERE user_id = %s AND date = %s 
            ORDER BY time DESC
        """, (request.user_id, datetime.date.today()))
        
        today_attendance = cursor.fetchall()
        
        # Format dates
        for record in today_attendance:
            if 'date' in record and record['date']:
                record['date'] = record['date'].isoformat()
            if 'time' in record and record['time']:
                record['time'] = str(record['time'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'date': datetime.date.today().isoformat(),
            'records': today_attendance,
            'count': len(today_attendance)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting today's attendance: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ==================== USER ROUTES ====================

@app.route('/api/users/profile', methods=['GET'])
@token_required
def get_user_profile():
    """Get user profile information"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, name, email, role, department, semester, phone, profile_image, created_at
            FROM users 
            WHERE user_id = %s
        """, (request.user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Format dates
        if 'created_at' in user and user['created_at']:
            user['created_at'] = user['created_at'].isoformat()
        
        # Get attendance stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
            FROM attendance 
            WHERE user_id = %s
        """, (request.user_id,))
        
        stats = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'user': user,
            'attendance_stats': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/users/update', methods=['PUT'])
@token_required
def update_user_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Fields that can be updated
        updatable_fields = ['name', 'department', 'semester', 'phone']
        update_data = {}
        
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Build update query
        set_clause = ', '.join([f"{field} = %s" for field in update_data.keys()])
        query = f"UPDATE users SET {set_clause} WHERE user_id = %s"
        
        values = list(update_data.values())
        values.append(request.user_id)
        
        cursor.execute(query, tuple(values))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'updated_fields': list(update_data.keys())
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/users', methods=['GET'])
@role_required(['admin'])
def get_all_users():
    """Get all users (admin only)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, name, email, role, department, semester, phone, created_at
            FROM users 
            ORDER BY created_at DESC
        """)
        
        users = cursor.fetchall()
        
        # Format dates
        for user in users:
            if 'created_at' in user and user['created_at']:
                user['created_at'] = user['created_at'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'count': len(users),
            'users': users
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting all users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/attendance', methods=['GET'])
@role_required(['admin', 'teacher'])
def get_all_attendance():
    """Get all attendance records (admin/teacher only)"""
    try:
        date = request.args.get('date')
        department = request.args.get('department')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Build query based on filters
        query = """
            SELECT a.*, u.name, u.department, u.semester
            FROM attendance a
            JOIN users u ON a.user_id = u.user_id
            WHERE 1=1
        """
        params = []
        
        if date:
            query += " AND a.date = %s"
            params.append(date)
        
        if department:
            query += " AND u.department = %s"
            params.append(department)
        
        query += " ORDER BY a.date DESC, a.time DESC LIMIT 200"
        
        cursor.execute(query, tuple(params))
        attendance_records = cursor.fetchall()
        
        # Format dates
        for record in attendance_records:
            if 'date' in record and record['date']:
                record['date'] = record['date'].isoformat()
            if 'time' in record and record['time']:
                record['time'] = str(record['time'])
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'count': len(attendance_records),
            'records': attendance_records
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting all attendance: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/stats', methods=['GET'])
@role_required(['admin', 'teacher'])
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get total users
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total_users = cursor.fetchone()['total']
        
        # Get total attendance today
        cursor.execute("SELECT COUNT(*) as total FROM attendance WHERE date = %s", (datetime.date.today(),))
        today_attendance = cursor.fetchone()['total']
        
        # Get attendance by status today
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
            FROM attendance 
            WHERE date = %s
        """, (datetime.date.today(),))
        
        today_stats = cursor.fetchone()
        
        # Get department-wise counts
        cursor.execute("""
            SELECT department, COUNT(*) as count 
            FROM users 
            WHERE department IS NOT NULL 
            GROUP BY department
        """)
        
        department_counts = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'total_users': total_users,
            'today_attendance': today_attendance,
            'today_stats': today_stats,
            'department_counts': department_counts
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting admin stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/users/<user_id>', methods=['GET'])
@role_required(['admin'])
def get_user_details(user_id):
    """Get single user details (admin only)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, name, email, role, department, semester, phone, profile_image, created_at
            FROM users WHERE user_id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's attendance stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
            FROM attendance WHERE user_id = %s
        """, (user_id,))
        
        attendance_stats = cursor.fetchone()
        
        if user['created_at']:
            user['created_at'] = user['created_at'].isoformat()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'user': user,
            'attendance_stats': attendance_stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user details: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/users/<user_id>', methods=['PUT'])
@role_required(['admin'])
def update_user(user_id):
    """Update user details (admin only)"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        allowed_fields = ['name', 'email', 'role', 'department', 'semester', 'phone']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        update_values.append(user_id)
        
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
        cursor.execute(query, tuple(update_values))
        
        connection.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'User updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@role_required(['admin'])
def delete_user(user_id):
    """Delete a user and their attendance records (admin only)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get user info first (for profile image cleanup)
        cursor.execute("SELECT profile_image FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Delete user's attendance records first (foreign key constraint)
        cursor.execute("DELETE FROM attendance WHERE user_id = %s", (user_id,))
        
        # Delete user
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        
        connection.commit()
        
        # Delete profile image file if exists
        if user['profile_image'] and os.path.exists(user['profile_image']):
            try:
                os.remove(user['profile_image'])
            except:
                pass
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/users/<user_id>/reset-password', methods=['POST'])
@role_required(['admin'])
def reset_user_password(user_id):
    """Reset a user's password (admin only)"""
    try:
        data = request.get_json()
        new_password = data.get('new_password', 'password123')  # Default password
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute("""
            UPDATE users SET password = %s WHERE user_id = %s
        """, (hashed_password.decode('utf-8'), user_id))
        
        connection.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Password reset successfully', 'temp_password': new_password}), 200
        
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/attendance/<int:attendance_id>', methods=['DELETE'])
@role_required(['admin'])
def delete_attendance(attendance_id):
    """Delete an attendance record (admin only)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        cursor.execute("DELETE FROM attendance WHERE id = %s", (attendance_id,))
        
        connection.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Attendance record not found'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Attendance record deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting attendance: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/attendance/<int:attendance_id>', methods=['PUT'])
@role_required(['admin'])
def update_attendance(attendance_id):
    """Update an attendance record (admin only)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['present', 'absent', 'late']:
            return jsonify({'error': 'Invalid status'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE attendance SET status = %s WHERE id = %s
        """, (new_status, attendance_id))
        
        connection.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Attendance record not found'}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Attendance record updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error updating attendance: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/setup', methods=['POST'])
def setup_first_admin():
    """Create the first admin user (only works if no admins exist)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if any admin already exists
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
        result = cursor.fetchone()
        admin_count = result['count'] if isinstance(result, dict) else result[0]
        
        if admin_count > 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Admin already exists. Use the admin panel to create more admins.'}), 400
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Email already registered'}), 400
        
        # Generate unique user_id
        user_id = f"ADMIN-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute("""
            INSERT INTO users (user_id, name, email, password, role, department, phone)
            VALUES (%s, %s, %s, %s, 'admin', %s, %s)
        """, (
            user_id,
            data['name'],
            data['email'],
            hashed_password.decode('utf-8'),
            data.get('department', 'Administration'),
            data.get('phone', '')
        ))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"First admin created: {user_id}")
        
        return jsonify({
            'message': 'First admin user created successfully. You can now login.',
            'user_id': user_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating first admin: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/create-admin', methods=['POST'])
@role_required(['admin'])
def create_admin_user():
    """Create a new admin user (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Email already registered'}), 400
        
        # Generate unique user_id
        user_id = f"ADMIN-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute("""
            INSERT INTO users (user_id, name, email, password, role, department, phone)
            VALUES (%s, %s, %s, %s, 'admin', %s, %s)
        """, (
            user_id,
            data['name'],
            data['email'],
            hashed_password.decode('utf-8'),
            data.get('department', 'Administration'),
            data.get('phone', '')
        ))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Admin user created successfully',
            'user_id': user_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating admin: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ==================== SYSTEM ROUTES ====================

@app.route('/api/system/health', methods=['GET'])
def system_health():
    """System health check endpoint"""
    try:
        # Check database connection
        connection = get_db_connection()
        db_status = 'healthy' if connection else 'unhealthy'
        
        if connection:
            connection.close()
        
        # Check upload folder
        upload_folder_status = 'healthy' if os.path.exists(app.config['UPLOAD_FOLDER']) else 'unhealthy'
        
        return jsonify({
            'status': 'operational',
            'timestamp': datetime.datetime.now().isoformat(),
            'components': {
                'database': db_status,
                'upload_folder': upload_folder_status,
                'api': 'healthy'
            },
            'version': '1.0.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'degraded',
            'error': str(e)
        }), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ==================== MAIN ENTRY POINT ====================

if __name__ == '__main__':
    # Initialize database
    logger.info("Initializing database...")
    if init_database():
        logger.info("Database initialization successful")
    else:
        logger.warning("Database initialization failed or already exists")
    
    # Run Flask app
    logger.info("Starting Smart Presence API server...")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )