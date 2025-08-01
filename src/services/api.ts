// API service for backend communication
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      console.log('🔑 No valid auth token found');
      return { 'Content-Type': 'application/json' };
    }
    console.log('🔑 Using auth token:', token.substring(0, 20) + '...');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Crypto data endpoints
  async getCryptoMarkets(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/crypto/markets`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Backend not available, falling back to CoinGecko directly:', error);
      // Fallback to CoinGecko API directly when backend is not available
      const fallbackResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h"
      );
      if (!fallbackResponse.ok) {
        throw new Error(`CoinGecko API error! status: ${fallbackResponse.status}`);
      }
      return fallbackResponse.json();
    }
  }

  async getCryptoChart(cryptoId: string, days: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/crypto/${cryptoId}/chart?days=${days}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Backend not available, falling back to CoinGecko directly:', error);
      // Fallback to CoinGecko API directly when backend is not available
      const fallbackResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
      );
      if (!fallbackResponse.ok) {
        throw new Error(`CoinGecko API error! status: ${fallbackResponse.status}`);
      }
      return fallbackResponse.json();
    }
  }

  // Favorites endpoints
  async getFavorites(): Promise<string[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token, skipping backend favorites fetch');
      return [];
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse(response);
      console.log('Backend favorites response:', data);
      
      // Extract crypto_id from favorites array
      return data.favorites ? data.favorites.map((fav: any) => fav.crypto_id) : [];
    } catch (error) {
      console.error('Failed to fetch favorites from backend:', error);
      throw error;
    }
  }

  async addFavorite(crypto: any): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required to add favorites');
    }
    
    try {
      const favoriteData = { 
        crypto_id: crypto.id,
        crypto_name: crypto.name,
        crypto_symbol: crypto.symbol,
        crypto_image: crypto.image,
        current_price: crypto.current_price
      };
      
      console.log('Adding favorite to backend:', favoriteData);
      
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(favoriteData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      await this.handleResponse(response);
      console.log('Successfully added favorite to backend');
    } catch (error) {
      console.error('Failed to add favorite to backend:', error);
      throw error;
    }
  }

  async removeFavorite(cryptoId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required to remove favorites');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${cryptoId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to remove favorite from backend:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await this.handleResponse(response);
      
      // Store token
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await this.handleResponse(response);
      
      // Store token
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  // JWT Test endpoint
  async testJWT(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-jwt`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('JWT test failed:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}

export const apiService = new ApiService();