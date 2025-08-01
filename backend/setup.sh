#!/bin/bash

# Crypto Tracker Backend Setup Script

echo "🚀 Setting up Crypto Tracker Backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo ""
    echo "🔒 IMPORTANT: Please update the .env file with your own secret keys!"
    echo "Generate strong random keys for:"
    echo "- SECRET_KEY"
    echo "- JWT_SECRET_KEY"
    echo ""
fi

# Initialize database
echo "🗄️ Initializing database..."
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
"

# Run tests
echo "🧪 Running tests..."
python -m pytest test_app.py -v

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Update the .env file with your secret keys"
echo "2. Activate virtual environment: source venv/bin/activate"
echo "3. Start the server: python app.py"
echo ""
echo "📡 The API will be available at: http://localhost:5000"
echo "📖 API documentation:"
echo "   - POST /api/auth/register - Register new user"
echo "   - POST /api/auth/login - Login user"
echo "   - GET  /api/auth/me - Get current user (requires JWT)"
echo "   - POST /api/crypto/data - Fetch crypto data"
echo "   - GET  /api/favorites - Get user favorites (requires JWT)"
echo "   - POST /api/favorites - Add favorite (requires JWT)"
echo "   - DELETE /api/favorites/<id> - Remove favorite (requires JWT)"
echo "   - GET  /api/health - Health check"