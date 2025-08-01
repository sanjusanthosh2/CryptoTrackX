from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from datetime import datetime, timedelta, timezone
import hashlib
import secrets

app = Flask(__name__)

# Simple, working configuration
app.config['SECRET_KEY'] = 'dev-secret-key-123'
app.config['JWT_SECRET_KEY'] = 'jwt-dev-secret-key-123'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crypto_tracker_new.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    favorites = db.relationship('Favorite', backref='user', lazy=True, cascade='all, delete-orphan')

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    crypto_id = db.Column(db.String(100), nullable=False)
    crypto_name = db.Column(db.String(100), nullable=False)
    crypto_symbol = db.Column(db.String(20), nullable=False)
    crypto_image = db.Column(db.String(255))
    current_price = db.Column(db.Float)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'crypto_id'),)

# Error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("🔍 JWT expired token error")
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"🔍 JWT invalid token error: {error}")
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"🔍 JWT missing token error: {error}")
    return jsonify({'error': 'Authorization token is required'}), 401

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'version': '2.0.0'
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data['email'].lower().strip()
        password = data['password']
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User already exists'}), 409
        
        user = User(
            email=email,
            password_hash=generate_password_hash(password)
        )
        
        db.session.add(user)
        db.session.commit()
        
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
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data['email'].lower().strip()
        password = data['password']
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
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
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/crypto/markets', methods=['GET'])
def get_crypto_markets():
    try:
        response = requests.get(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h",
            timeout=10
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': f'Failed to fetch crypto data: {str(e)}'}), 500

@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    try:
        print("🔍 get_favorites called")
        user_id = get_jwt_identity()
        print(f"🔍 User ID from token: {user_id}")
        favorites = Favorite.query.filter_by(user_id=user_id).all()
        print(f"🔍 Found {len(favorites)} favorites")
        
        return jsonify([fav.crypto_id for fav in favorites])
    except Exception as e:
        print(f"🔍 Error in get_favorites: {str(e)}")
        return jsonify({'error': f'Failed to get favorites: {str(e)}'}), 500

@app.route('/api/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Check if already exists
        existing = Favorite.query.filter_by(
            user_id=user_id, 
            crypto_id=data['crypto_id']
        ).first()
        
        if existing:
            return jsonify({'message': 'Already in favorites'}), 200
        
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
        
        return jsonify({'message': 'Added to favorites'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add favorite: {str(e)}'}), 500

@app.route('/api/favorites/<crypto_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(crypto_id):
    try:
        user_id = get_jwt_identity()
        favorite = Favorite.query.filter_by(
            user_id=user_id, 
            crypto_id=crypto_id
        ).first()
        
        if favorite:
            db.session.delete(favorite)
            db.session.commit()
        
        return jsonify({'message': 'Removed from favorites'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to remove favorite: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Database tables created")
        print("🚀 Starting Flask server on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)