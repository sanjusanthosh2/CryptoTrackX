#!/bin/bash

# Crypto Tracker Backend Runner Script
# This script activates the virtual environment and starts the backend server

echo "🚀 Starting Crypto Tracker Backend..."

# Check if we're in the backend directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "💡 Tip: cd backend && ./run_backend.sh"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "💡 Please run setup.sh first to create the virtual environment"
    echo "   ./setup.sh"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found, copying from .env.example..."
    cp .env.example .env
    echo "🔒 Please update the .env file with secure secret keys!"
fi

# Install/update dependencies
echo "📦 Checking dependencies..."
pip install -q -r requirements.txt

# Start the server
echo "🌟 Starting server..."
python start.py