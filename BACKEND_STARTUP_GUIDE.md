# 🚀 Backend Startup Guide

## Quick Start (Recommended)

The backend is **NOT currently running** which is why favorites aren't storing in the database. Follow these steps to start it:

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Set Up Backend (First Time Only)
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup (creates virtual environment, installs dependencies, creates database)
./setup.sh
```

### 3. Start the Backend Server
```bash
# Make run script executable  
chmod +x run_backend.sh

# Start the server
./run_backend.sh
```

**OR** alternatively:
```bash
# Activate virtual environment
source venv/bin/activate

# Start server
python start.py
```

### 4. Verify Backend is Running
- Open browser to: `http://localhost:5000/api/health`
- Should see: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

## What This Fixes

✅ **Favorites Storage**: Users will have individual favorite lists stored in database  
✅ **Authentication**: Login/register will work with JWT tokens  
✅ **Backend Integration**: All API calls will use your backend instead of direct CoinGecko calls  
✅ **Network Status**: Status indicator will show "Backend Connected"  

## Current Issue Analysis

The console logs show repeated `Failed to fetch` errors for:
- `http://localhost:5000/api/crypto/markets` 
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/auth/login`

This confirms the backend server is not running. The frontend is correctly falling back to CoinGecko API for market data, but features requiring database storage (like user favorites) cannot work without the backend.

## Backend Features

Once running, your backend provides:

### 🔐 Authentication
- User registration and login
- JWT token-based sessions
- Password hashing with PBKDF2

### 💰 Crypto Data  
- Proxy to CoinGecko API with caching
- Market data and charts
- Error handling and fallbacks

### ⭐ User Favorites
- **Individual user favorites** (this fixes the shared favorites issue)
- Add/remove cryptocurrencies to personal list
- Persistent storage in SQLite database

### 🗄️ Database
- SQLite database with User and Favorite tables
- Automatic table creation
- User data isolation

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Permission Errors
```bash
# Make scripts executable
chmod +x *.sh
```

### Python/Pip Issues
```bash
# Ensure Python 3.8+ is installed
python3 --version

# Update pip in virtual environment
source venv/bin/activate
pip install --upgrade pip
```

After starting the backend, refresh your frontend and you should see:
1. Network status shows "Backend Connected" 
2. Favorites are stored per user in the database
3. Authentication works properly
4. No more "Failed to fetch" errors in console