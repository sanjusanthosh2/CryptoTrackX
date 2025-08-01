from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, verify_jwt_in_request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
import secrets
import requests
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secret-key-for-development-only')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-super-secret-key-for-development-only')
# app.config['SECRET_KEY'] = 'super-secret-key-for-development-only'
# app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key-for-development-only'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Extended for testing
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///crypto_tracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(f"🔧 JWT_SECRET_KEY configured: {app.config['JWT_SECRET_KEY'][:20]}...")

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, origins=[
    'http://localhost:8080', 
    'https://your-frontend-domain.com',
    'https://id-preview--d539e311-f3ec-4617-a26d-5adc220c40e2.lovable.app',
    'https://d539e311-f3ec-4617-a26d-5adc220c40e2.lovableproject.com',
    'https://preview.lovable.dev'
], supports_credentials=True)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    password_salt = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationship
    favorites = db.relationship('Favorite', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    crypto_id = db.Column(db.String(100), nullable=False)
    crypto_name = db.Column(db.String(100), nullable=False)
    crypto_symbol = db.Column(db.String(20), nullable=False)
    crypto_image = db.Column(db.String(255))
    current_price = db.Column(db.Float)
    added_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'crypto_id'),)

    def to_dict(self):
        return {
            'id': self.id,
            'crypto_id': self.crypto_id,
            'crypto_name': self.crypto_name,
            'crypto_symbol': self.crypto_symbol,
            'crypto_image': self.crypto_image,
            'current_price': self.current_price,
            'added_at': self.added_at.isoformat()
        }

# Helper functions
def generate_salt():
    """Generate a random salt for password hashing"""
    return secrets.token_hex(32)

def hash_password_pbkdf2(password, salt):
    """Hash password using PBKDF2 with 100,000 iterations"""
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def verify_password(password, salt, hash_to_check):
    """Verify password against stored hash"""
    return hash_password_pbkdf2(password, salt) == hash_to_check

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"🚫 INVALID TOKEN ERROR: {error}")
    app.logger.error(f"Invalid token error: {error}")
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"🚫 MISSING TOKEN ERROR: {error}")
    app.logger.error(f"Missing token error: {error}")
    return jsonify({'error': 'Authorization token is required'}), 401

# Add request logging for debugging
@app.before_request
def log_request_info():
    if request.path.startswith('/api'):
        print(f"🌐 {request.method} {request.path}")
        auth_header = request.headers.get('Authorization')
        if auth_header:
            print(f"🔑 Auth header received: {auth_header[:50]}...")
        else:
            print("🔑 No auth header found")

# Routes

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'version': '1.0.0'
    })

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Validate email format
        if '@' not in email or len(email) < 5:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Generate salt and hash password
        salt = generate_salt()
        password_hash = hash_password_pbkdf2(password, salt)
        
        # Create user
        user = User(
            email=email,
            password_hash=password_hash,
            password_salt=salt
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'created_at': user.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not verify_password(password, user.password_salt, user.password_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'created_at': user.created_at.isoformat()
            }
        })
        
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'created_at': user.created_at.isoformat(),
                'favorites_count': len(user.favorites)
            }
        })
        
    except Exception as e:
        app.logger.error(f"Get user error: {str(e)}")
        return jsonify({'error': 'Failed to get user information'}), 500

# JWT Test endpoint
@app.route('/api/test-jwt', methods=['GET'])
@jwt_required()
def test_jwt():
    try:
        user_id = get_jwt_identity()
        print(f"🧪 JWT Test successful, user_id: {user_id}")
        return jsonify({
            'message': 'JWT verification successful',
            'user_id': user_id,
            'jwt_secret_key_hash': hashlib.sha256(app.config['JWT_SECRET_KEY'].encode()).hexdigest()[:16]
        })
    except Exception as e:
        print(f"🧪 JWT Test failed: {e}")
        return jsonify({'error': f'JWT test failed: {str(e)}'}), 401

# Crypto data endpoints
@app.route('/api/crypto/markets', methods=['GET'])
def get_crypto_markets():
    try:
        base_url = "https://api.coingecko.com/api/v3"
        url = f"{base_url}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': False,
            'price_change_percentage': '24h'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch crypto data'}), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout'}), 504
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Crypto API error: {str(e)}")
        return jsonify({'error': 'Failed to fetch crypto data'}), 503
    except Exception as e:
        app.logger.error(f"Crypto data error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/crypto/<crypto_id>/chart', methods=['GET'])
def get_crypto_chart(crypto_id):
    try:
        days = request.args.get('days', '7')
        base_url = "https://api.coingecko.com/api/v3"
        url = f"{base_url}/coins/{crypto_id}/market_chart"
        params = {
            'vs_currency': 'usd',
            'days': days,
            'interval': 'daily' if int(days) > 30 else 'hourly'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch chart data'}), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout'}), 504
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Chart API error: {str(e)}")
        return jsonify({'error': 'Failed to fetch chart data'}), 503
    except Exception as e:
        app.logger.error(f"Chart data error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/crypto/data', methods=['POST'])
def get_crypto_data():
    try:
        data = request.get_json()
        endpoint = data.get('endpoint')
        params = data.get('params', {})
        
        base_url = 'https://api.coingecko.com/api/v3'
        
        if endpoint == 'market':
            # Get market data
            url = f"{base_url}/coins/markets"
            default_params = {
                'vs_currency': 'usd',
                'order': 'market_cap_desc',
                'per_page': 100,
                'page': 1,
                'sparkline': False,
                'price_change_percentage': '24h'
            }
            default_params.update(params)
            
            response = requests.get(url, params=default_params, timeout=10)
            
        elif endpoint == 'chart':
            # Get chart data
            crypto_id = params.get('id', 'bitcoin')
            days = params.get('days', '7')
            url = f"{base_url}/coins/{crypto_id}/market_chart"
            chart_params = {
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily' if int(days) > 30 else 'hourly'
            }
            
            response = requests.get(url, params=chart_params, timeout=10)
            
        else:
            return jsonify({'error': 'Invalid endpoint'}), 400
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch crypto data'}), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout'}), 504
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Crypto API error: {str(e)}")
        return jsonify({'error': 'Failed to fetch crypto data'}), 503
    except Exception as e:
        app.logger.error(f"Crypto data error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Custom JWT verification function for debugging
def debug_jwt_verification():
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        print(f"✅ JWT verification successful, user_id: {user_id}")
        return user_id
    except Exception as e:
        print(f"❌ JWT verification failed: {e}")
        raise e

# Favorites endpoints
@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    try:
        print("🔍 GET /api/favorites - Starting JWT verification...")
        user_id = debug_jwt_verification()
        favorites = Favorite.query.filter_by(user_id=user_id).order_by(Favorite.added_at.desc()).all()
        
        return jsonify({
            'favorites': [fav.to_dict() for fav in favorites],
            'count': len(favorites)
        })
        
    except Exception as e:
        app.logger.error(f"Get favorites error: {str(e)}")
        return jsonify({'error': 'Failed to get favorites'}), 500

@app.route('/api/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        print("🔍 POST /api/favorites - Starting JWT verification...")
        user_id = debug_jwt_verification()
        data = request.get_json()
        
        required_fields = ['crypto_id', 'crypto_name', 'crypto_symbol']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if already favorited
        existing = Favorite.query.filter_by(
            user_id=user_id,
            crypto_id=data['crypto_id']
        ).first()
        
        if existing:
            return jsonify({'error': 'Cryptocurrency already in favorites'}), 409
        
        # Create favorite
        favorite = Favorite(
            user_id=user_id,
            crypto_id=data['crypto_id'],
            crypto_name=data['crypto_name'],
            crypto_symbol=data['crypto_symbol'],
            crypto_image=data.get('crypto_image'),
            current_price=data.get('current_price')
        )
        
        db.session.add(favorite)
        db.session.commit()
        
        return jsonify({
            'message': 'Added to favorites successfully',
            'favorite': favorite.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Add favorite error: {str(e)}")
        return jsonify({'error': 'Failed to add favorite'}), 500

@app.route('/api/favorites/<crypto_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(crypto_id):
    try:
        print("🔍 DELETE /api/favorites - Starting JWT verification...")
        user_id = debug_jwt_verification()
        
        favorite = Favorite.query.filter_by(
            user_id=user_id,
            crypto_id=crypto_id
        ).first()
        
        if not favorite:
            return jsonify({'error': 'Favorite not found'}), 404
        
        db.session.delete(favorite)
        db.session.commit()
        
        return jsonify({'message': 'Removed from favorites successfully'})
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Remove favorite error: {str(e)}")
        return jsonify({'error': 'Failed to remove favorite'}), 500

# Initialize database
def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    # Create tables
    create_tables()
    
    print("🚀 Starting Crypto Tracker Backend...")
    print(f"📡 API available at: http://localhost:{int(os.getenv('PORT', 5000))}")
    print("📖 Health check: /api/health")
    print("🔐 Authentication endpoints: /api/auth/register, /api/auth/login")
    print("💰 Crypto endpoints: /api/crypto/markets, /api/crypto/{id}/chart")
    print("⭐ Favorites endpoints: /api/favorites")
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_ENV', 'development') == 'development'
    )