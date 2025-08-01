# 🚀 Crypto Tracker - Complete Startup Guide

## Quick Start (Recommended)

### 1. Backend Setup & Start
```bash
# Navigate to project root
cd your-project-directory

# Make startup script executable and run
chmod +x start_backend.sh
./start_backend.sh
```

### 2. Frontend Setup
The frontend is automatically handled by Lovable and should start immediately after the backend is running.

### 3. Test the Application
1. Visit your Lovable preview URL
2. Register a new user account
3. Try adding/removing cryptocurrency favorites
4. Check that data persists when you refresh the page

## Manual Setup (Alternative)

### Backend Setup
```bash
# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# .venv\Scripts\activate   # On Windows

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Start the backend server
python backend/app.py
```

### Frontend Setup
```bash
# The frontend runs automatically in Lovable
# No additional setup required
```

## Verification Steps

### ✅ Backend Health Check
Visit: `http://localhost:5000/api/health`
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-22T...",
  "version": "1.0.0"
}
```

### ✅ Authentication Test
1. Click "Login" in the app
2. Register with email/password
3. Check browser localStorage for token
4. Verify you can add favorites

### ✅ Database Verification
Check that these files exist:
- `backend/crypto_tracker.db` (main database)
- `backend/database.db` (backup/alternative)

## Environment Configuration

### Required Environment Variables (Optional)
```bash
# Backend (.env file in backend/ directory)
JWT_SECRET_KEY=your-super-secret-jwt-key-here
PORT=5000
FLASK_ENV=development
DATABASE_URL=sqlite:///crypto_tracker.db
```

### Frontend Configuration
API configuration is automatically set in `src/config/api.ts`:
- Development: `http://localhost:5000/api`
- Production: Auto-detects and falls back to CoinGecko

## Troubleshooting

### Common Issues & Solutions

#### 🔴 "Failed to fetch" errors
**Cause**: Backend not running
**Solution**: 
```bash
./start_backend.sh
# or manually: python backend/app.py
```

#### 🔴 "401 Unauthorized" for favorites
**Cause**: Invalid or missing auth token
**Solution**:
1. Clear browser localStorage
2. Register/login again
3. Check backend logs for JWT errors

#### 🔴 "Token undefined" in console
**Cause**: Authentication response missing access_token
**Solution**:
1. Check backend `/auth/login` endpoint
2. Verify JWT_SECRET_KEY is set
3. Clear localStorage and re-authenticate

#### 🔴 Database permission errors
**Cause**: SQLite file permissions
**Solution**:
```bash
chmod 664 backend/crypto_tracker.db
chmod 775 backend/
```

### Debug Commands

#### Check Backend Status
```bash
curl http://localhost:5000/api/health
```

#### Check Database
```bash
sqlite3 backend/crypto_tracker.db ".tables"
sqlite3 backend/crypto_tracker.db "SELECT * FROM user;"
```

#### View Backend Logs
Backend logs appear in the terminal where you ran the startup script.

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Crypto Data
- `GET /api/crypto/markets` - Get cryptocurrency market data
- `GET /api/crypto/{id}/chart?days=7` - Get price chart data

### Favorites (Requires Authentication)
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/{crypto_id}` - Remove from favorites

### System
- `GET /api/health` - Health check

## Development Mode Features

### Hot Reload
- Frontend: Automatic (Vite)
- Backend: Manual restart required

### Debug Logging
- Frontend: Browser DevTools Console
- Backend: Terminal output with detailed logs

### Database Inspection
Use any SQLite browser or command line:
```bash
sqlite3 backend/crypto_tracker.db
.schema
SELECT * FROM user;
SELECT * FROM favorite;
```

## Production Deployment Notes

1. **Environment Variables**: Set proper JWT_SECRET_KEY
2. **Database**: Consider PostgreSQL for production
3. **CORS**: Update allowed origins in backend
4. **HTTPS**: Enable SSL certificates
5. **Error Handling**: Implement proper logging service

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for frontend errors
3. Check backend terminal for server errors
4. Verify all files exist and have proper permissions

Happy coding! 🎉