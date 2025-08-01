# API Key Configuration Guide

## CoinGecko API (Currently Used)

**Good News: No API Key Required!** 

The app currently uses CoinGecko's free public API which doesn't require an API key for basic market data. The endpoints used are:

- `https://api.coingecko.com/api/v3/coins/markets` - Market data
- `https://api.coingecko.com/api/v3/coins/{id}/market_chart` - Price charts

## Where API Keys Would Be Configured (If Needed)

### Option 1: Backend Configuration (Recommended)
If you need to upgrade to CoinGecko Pro API:

1. **Backend file**: `backend/app.py`
2. **Lines to modify**: 241, 272, 303 (wherever `base_url` is defined)
3. **How to add**: Create a `.env` file in backend folder:
   ```
   COINGECKO_API_KEY=your_api_key_here
   ```
4. **Update backend code**:
   ```python
   headers = {
       'X-CG-Demo-API-Key': os.getenv('COINGECKO_API_KEY')
   }
   response = requests.get(url, params=params, headers=headers, timeout=10)
   ```

### Option 2: Frontend Configuration (Not Recommended)
If you want to use API keys directly in frontend:

1. **File**: `src/services/api.ts`
2. **Add to headers** in the CoinGecko fallback calls
3. **Note**: This exposes your API key publicly!

## Current API Endpoints

### Backend Endpoints (When Running)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/{id}` - Remove favorite
- `GET /api/crypto/markets` - Crypto market data (proxied)
- `GET /api/crypto/{id}/chart` - Chart data (proxied)

### Fallback API (Always Works)
- `https://api.coingecko.com/api/v3/coins/markets` - Direct CoinGecko access

## Why Favorites Aren't Working

The main issue is **backend not running**, not missing API keys:

1. **Start the backend**: Run `./start_backend.sh` from project root
2. **Check database**: Look for `backend/crypto_tracker.db` file
3. **Verify connection**: Test `http://localhost:5000/api/health`

## Rate Limits

- **CoinGecko Free**: 10-50 calls/minute (usually sufficient)
- **CoinGecko Pro**: 500+ calls/minute (requires API key)

**Current Status**: Using free tier, no API key needed!