// API Configuration
export const API_CONFIG = {
  // Try Glitch backend first, then localhost
  BASE_URL: 'http://localhost:5000/api',
  
  // Fallback URLs to try if primary fails
  FALLBACK_URLS: [
    'http://localhost:5000/api',
    'https://crypto-tracker-backend.glitch.me/api',
    'http://127.0.0.1:5000/api'
  ],
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Enable fallback to CoinGecko API when backend is unavailable
  ENABLE_FALLBACK: true,
};