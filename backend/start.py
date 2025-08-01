#!/usr/bin/env python3
"""
Quick start script for the Crypto Tracker Backend
This script sets up and runs the backend server with proper initialization
"""

import os
import sys
from app import app, db

def setup_database():
    """Initialize the database"""
    print("🗄️ Setting up database...")
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized successfully!")
        except Exception as e:
            print(f"❌ Database setup failed: {e}")
            sys.exit(1)

def main():
    """Main function to start the server"""
    print("🚀 Crypto Tracker Backend Starting...")
    
    # Setup database
    setup_database()
    
    # Get configuration
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print(f"""
📡 Server Configuration:
   - Host: 0.0.0.0
   - Port: {port}
   - Debug: {debug}
   - Database: {app.config['SQLALCHEMY_DATABASE_URI']}

🔗 Available Endpoints:
   - GET  /api/health              - Health check
   - POST /api/auth/register       - User registration
   - POST /api/auth/login          - User login
   - GET  /api/auth/me             - Get current user (JWT required)
   - GET  /api/crypto/markets      - Get crypto market data
   - GET  /api/crypto/<id>/chart   - Get crypto chart data
   - GET  /api/favorites           - Get user favorites (JWT required)
   - POST /api/favorites           - Add favorite (JWT required)
   - DELETE /api/favorites/<id>    - Remove favorite (JWT required)

🌐 Frontend CORS: Configured for Lovable domains
💾 Data: SQLite database with user auth and favorites

✅ Ready to accept connections!
""")
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug,
            use_reloader=debug
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()