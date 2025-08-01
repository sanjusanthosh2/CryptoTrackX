# Backend Setup Instructions

## Quick Start (Recommended)

The backend server needs to be running for user data and favorites to be stored in the database.

### Option 1: One-Command Startup
```bash
# Make startup script executable and run
chmod +x start_backend.sh && ./start_backend.sh
```

### Option 2: Manual Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the server
python start.py
```

## What the Backend Provides

✅ **User Authentication**: Register and login functionality
✅ **Favorites Storage**: Save your favorite cryptocurrencies to database
✅ **Personal Data**: Each user gets their own favorites list
✅ **Database Persistence**: Data is stored in SQLite database file

## Database Location

- Database file: `backend/crypto_tracker.db`
- This file stores all user accounts and favorites
- The file is created automatically when you first run the backend

## Troubleshooting

If you see "Backend not available" errors:

1. **Check if backend is running**: Look for "Ready to accept connections!" message
2. **Port conflicts**: Backend runs on port 5000 by default
3. **Dependencies**: Make sure Python and pip are installed
4. **Firewall**: Ensure port 5000 is not blocked

## Backend Features Working

Once the backend is running, you'll have:
- ✅ User registration and login
- ✅ Personal favorites that persist between sessions
- ✅ Secure JWT authentication
- ✅ Individual user data separation

**Note**: Without the backend, the app will work but favorites will only be stored locally in your browser.