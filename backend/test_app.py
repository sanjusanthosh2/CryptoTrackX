import unittest
import json
import tempfile
import os
from app import app, db, User, Favorite

class CryptoTrackerTestCase(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + app.config['DATABASE']
        app.config['JWT_SECRET_KEY'] = 'test-secret-key'
        app.config['SECRET_KEY'] = 'test-secret-key'
        
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        """Tear down test fixtures"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        os.close(self.db_fd)
        os.unlink(app.config['DATABASE'])
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_user_registration(self):
        """Test user registration"""
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('token', data)
        self.assertEqual(data['user']['email'], 'test@example.com')
    
    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        # Register first user
        self.app.post('/api/auth/register', 
                     json={'email': 'test@example.com', 'password': 'password123'})
        
        # Try to register with same email
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password456'})
        self.assertEqual(response.status_code, 409)
    
    def test_user_registration_invalid_data(self):
        """Test registration with invalid data"""
        # Missing email
        response = self.app.post('/api/auth/register', json={'password': 'password123'})
        self.assertEqual(response.status_code, 400)
        
        # Missing password
        response = self.app.post('/api/auth/register', json={'email': 'test@example.com'})
        self.assertEqual(response.status_code, 400)
        
        # Short password
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': '123'})
        self.assertEqual(response.status_code, 400)
    
    def test_user_login(self):
        """Test user login"""
        # Register user first
        self.app.post('/api/auth/register', 
                     json={'email': 'test@example.com', 'password': 'password123'})
        
        # Login
        response = self.app.post('/api/auth/login', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('token', data)
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        # Register user first
        self.app.post('/api/auth/register', 
                     json={'email': 'test@example.com', 'password': 'password123'})
        
        # Wrong password
        response = self.app.post('/api/auth/login', 
                                json={'email': 'test@example.com', 'password': 'wrongpassword'})
        self.assertEqual(response.status_code, 401)
        
        # Wrong email
        response = self.app.post('/api/auth/login', 
                                json={'email': 'wrong@example.com', 'password': 'password123'})
        self.assertEqual(response.status_code, 401)
    
    def test_get_current_user(self):
        """Test getting current user info"""
        # Register and login
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        token = json.loads(response.data)['token']
        
        # Get user info
        response = self.app.get('/api/auth/me', 
                               headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['user']['email'], 'test@example.com')
    
    def test_get_current_user_unauthorized(self):
        """Test getting user info without token"""
        response = self.app.get('/api/auth/me')
        self.assertEqual(response.status_code, 401)
    
    def test_add_favorite(self):
        """Test adding cryptocurrency to favorites"""
        # Register and login
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        token = json.loads(response.data)['token']
        
        # Add favorite
        favorite_data = {
            'crypto_id': 'bitcoin',
            'crypto_name': 'Bitcoin',
            'crypto_symbol': 'BTC',
            'crypto_image': 'https://example.com/bitcoin.png',
            'current_price': 50000.0
        }
        
        response = self.app.post('/api/favorites', 
                                json=favorite_data,
                                headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['favorite']['crypto_id'], 'bitcoin')
    
    def test_add_favorite_duplicate(self):
        """Test adding duplicate favorite"""
        # Register and login
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        token = json.loads(response.data)['token']
        
        favorite_data = {
            'crypto_id': 'bitcoin',
            'crypto_name': 'Bitcoin',
            'crypto_symbol': 'BTC'
        }
        
        # Add favorite first time
        self.app.post('/api/favorites', 
                     json=favorite_data,
                     headers={'Authorization': f'Bearer {token}'})
        
        # Try to add same favorite again
        response = self.app.post('/api/favorites', 
                                json=favorite_data,
                                headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 409)
    
    def test_get_favorites(self):
        """Test getting user favorites"""
        # Register and login
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        token = json.loads(response.data)['token']
        
        # Add a favorite
        favorite_data = {
            'crypto_id': 'bitcoin',
            'crypto_name': 'Bitcoin',
            'crypto_symbol': 'BTC'
        }
        self.app.post('/api/favorites', 
                     json=favorite_data,
                     headers={'Authorization': f'Bearer {token}'})
        
        # Get favorites
        response = self.app.get('/api/favorites', 
                               headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['favorites']), 1)
        self.assertEqual(data['favorites'][0]['crypto_id'], 'bitcoin')
    
    def test_remove_favorite(self):
        """Test removing favorite"""
        # Register and login
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        token = json.loads(response.data)['token']
        
        # Add a favorite
        favorite_data = {
            'crypto_id': 'bitcoin',
            'crypto_name': 'Bitcoin',
            'crypto_symbol': 'BTC'
        }
        self.app.post('/api/favorites', 
                     json=favorite_data,
                     headers={'Authorization': f'Bearer {token}'})
        
        # Remove favorite
        response = self.app.delete('/api/favorites/bitcoin', 
                                  headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        
        # Verify it's removed
        response = self.app.get('/api/favorites', 
                               headers={'Authorization': f'Bearer {token}'})
        data = json.loads(response.data)
        self.assertEqual(len(data['favorites']), 0)
    
    def test_remove_nonexistent_favorite(self):
        """Test removing non-existent favorite"""
        # Register and login
        response = self.app.post('/api/auth/register', 
                                json={'email': 'test@example.com', 'password': 'password123'})
        token = json.loads(response.data)['token']
        
        # Try to remove non-existent favorite
        response = self.app.delete('/api/favorites/bitcoin', 
                                  headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 404)
    
    def test_crypto_data_endpoint(self):
        """Test crypto data proxy endpoint"""
        # Test market data
        response = self.app.post('/api/crypto/data', 
                                json={
                                    'endpoint': 'market',
                                    'params': {'per_page': 10}
                                })
        # Note: This will fail in test environment without internet
        # In real tests, you'd mock the requests call
        self.assertIn(response.status_code, [200, 503, 504])
    
    def test_password_encryption(self):
        """Test password encryption and verification"""
        from app import generate_salt, hash_password_pbkdf2, verify_password
        
        password = "testpassword123"
        salt = generate_salt()
        
        # Hash the password
        hashed = hash_password_pbkdf2(password, salt)
        
        # Verify correct password
        self.assertTrue(verify_password(password, salt, hashed))
        
        # Verify incorrect password
        self.assertFalse(verify_password("wrongpassword", salt, hashed))
        
        # Ensure salt is different each time
        salt2 = generate_salt()
        self.assertNotEqual(salt, salt2)

if __name__ == '__main__':
    unittest.main()