# CryptoTrackX – Project Overview

## 1. Introduction

CryptoTrackX is a full-stack web application for tracking cryptocurrency prices, viewing market data, and managing personal favorites. It features secure user authentication, real-time data, and a responsive UI.

---

## 2. Technology Stack

- **Frontend:** React (TypeScript), Tailwind CSS, Vite, React Query, React Router
- **Backend:** Python Flask (REST API), SQLite, JWT authentication, Requests (for CoinGecko API)
- **Other:** CoinGecko API, Docker support, Environment variables for configuration

---

## 3. Features & Implementation

### 3.1 User Authentication

- Users can register and log in.
- Passwords are hashed with PBKDF2 before storage.
- JWT tokens are issued on login and required for protected endpoints.
- Tokens are stored in browser localStorage.

### 3.2 Crypto Data Fetching

- The backend fetches market data and charts from the CoinGecko API.
- Endpoints:
  - `/api/crypto/markets` – Top cryptocurrencies
  - `/api/crypto/{id}/chart` – Price history for a specific coin

### 3.3 Favorites Management

- Authenticated users can add/remove favorites.
- Favorites are stored in the backend database and linked to the user.
- Guests’ favorites are stored in browser localStorage.

### 3.4 Fallback Mode

- If the backend is unavailable, the frontend fetches public data directly from CoinGecko.
- In fallback mode, authentication and favorites are disabled.

### 3.5 UI/UX

- Responsive dashboard with cards for each cryptocurrency.
- Search, filter, and favorite functionality.
- Chart modal for price history.
- Network status indicator.
- Authentication modal for login/register.

---

## 4. Security Aspects

- **Authentication:** JWT tokens for all protected endpoints.
- **Password Security:** PBKDF2 hashing.
- **API Security:** CORS configured, JWT required for sensitive endpoints.
- **Data Privacy:** User data is isolated; no sensitive data sent to third parties.

---

## 5. How It Works

1. **User visits the app:**  
   - Frontend checks backend health.
   - Uses backend for API calls if available; otherwise, falls back to CoinGecko.

2. **User registers/logs in:**  
   - Credentials sent to backend, JWT returned and stored.
   - JWT included in headers for further requests.

3. **Crypto data display:**  
   - Market data and charts fetched via backend or CoinGecko.

4. **Favorites:**  
   - Authenticated users: Favorites stored in backend DB.
   - Guests: Favorites stored in localStorage.

5. **Security:**  
   - All sensitive actions require JWT.
   - Passwords never stored or sent in plain text.

---

## 6. File Structure (Key Files)

- `src/services/api.ts` – Frontend API service logic
- `backend/app.py` – Flask backend logic
- `STARTUP_GUIDE.md` – Setup instructions
- `FRONTEND_BACKEND_INTEGRATION.md` – Integration details
- `BACKEND_SETUP_INSTRUCTIONS.md` – Backend setup

---

## 7. Summary

CryptoTrackX is a secure, modern, and extensible crypto tracker with robust authentication, real-time data, and high availability through backend fallback.

---

**For more details, refer to the code and documentation files
