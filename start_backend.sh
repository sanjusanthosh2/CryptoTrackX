#!/bin/bash

# Quick Backend Starter Script for Crypto Tracker
# Run this from the root directory to start the backend server

echo "🚀 Crypto Tracker - Starting Backend Server"
echo "=============================================="

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found!"
    echo "💡 Please make sure you're running this from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    echo "💡 Please install Python 3.8+ and try again"
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Virtual environment not found, creating one..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Updating pip..."
pip install --upgrade pip --quiet

# Install requirements
echo "📚 Installing/updating dependencies..."
pip install -r requirements.txt --quiet

# Check if .env exists, create from example if not
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "🔒 IMPORTANT: Update the .env file with secure secret keys for production!"
fi

# Initialize database
echo "🗄️ Initializing database..."
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('✅ Database initialized!')
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  Database initialization had some issues, but continuing..."
fi

echo ""
echo "🌟 Starting Crypto Tracker Backend Server..."
echo "📡 The server will be available at: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/api/health"
echo ""
echo "📊 Available endpoints:"
echo "   - GET  /api/health              - Health check"
echo "   - POST /api/auth/register       - User registration"
echo "   - POST /api/auth/login          - User login"
echo "   - GET  /api/auth/me             - Get current user"
echo "   - GET  /api/crypto/markets      - Crypto market data"
echo "   - GET  /api/crypto/{id}/chart   - Crypto chart data"
echo "   - GET  /api/favorites           - User favorites"
echo "   - POST /api/favorites           - Add favorite"
echo "   - DELETE /api/favorites/{id}    - Remove favorite"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo "=============================================="

# Start the Flask application
python app.py