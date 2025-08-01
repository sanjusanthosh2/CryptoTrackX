import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
  image: string;
  total_volume: number;
  circulating_supply: number;
  max_supply?: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user, token } = useAuth();

  // Load favorites from backend when user is authenticated
  useEffect(() => {
    if (user && token && token !== 'undefined' && token !== 'null') {
      loadUserFavorites();
    } else {
      // Load from localStorage for unauthenticated users
      const savedFavorites = localStorage.getItem("crypto-favorites");
      if (savedFavorites) {
        try {
          const favoritesArray = JSON.parse(savedFavorites);
          setFavorites(new Set(favoritesArray));
        } catch (error) {
          console.error("Failed to parse favorites from localStorage:", error);
        }
      }
    }
  }, [user, token]);

  // Save favorites to localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem("crypto-favorites", JSON.stringify(Array.from(favorites)));
    }
  }, [favorites, user]);

  const loadUserFavorites = useCallback(async () => {
    if (!user || !token || token === 'undefined' || token === 'null') return;
    
    try {
      const userFavorites = await apiService.getFavorites();
      setFavorites(new Set(userFavorites));
    } catch (error) {
      console.error("Failed to load user favorites:", error);
      // Fallback to localStorage when backend is unavailable
      const savedFavorites = localStorage.getItem("crypto-favorites");
      if (savedFavorites) {
        try {
          const favoritesArray = JSON.parse(savedFavorites);
          setFavorites(new Set(favoritesArray));
        } catch (parseError) {
          console.error("Failed to parse favorites from localStorage:", parseError);
        }
      }
    }
  }, [user, token]);

  const addToFavorites = useCallback(async (crypto: CryptoData) => {
    try {
      if (user && token) {
        await apiService.addFavorite(crypto);
      }
      
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.add(crypto.id);
        return newFavorites;
      });

      toast({
        title: "Added to favorites",
        description: `${crypto.name} has been added to your favorites.`,
      });
    } catch (error: any) {
      console.error("Failed to add favorite:", error);
      toast({
        title: "Error adding favorite",
        description: error.message || "Failed to add to favorites.",
        variant: "destructive",
      });
    }
  }, [user, token]);

  const removeFromFavorites = useCallback(async (cryptoId: string) => {
    try {
      if (user && token) {
        await apiService.removeFavorite(cryptoId);
      }
      
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(cryptoId);
        return newFavorites;
      });

      toast({
        title: "Removed from favorites",
        description: "Cryptocurrency has been removed from your favorites.",
      });
    } catch (error: any) {
      console.error("Failed to remove favorite:", error);
      toast({
        title: "Error removing favorite",
        description: error.message || "Failed to remove from favorites.",
        variant: "destructive",
      });
    }
  }, [user, token]);

  const toggleFavorite = useCallback((crypto: CryptoData) => {
    if (favorites.has(crypto.id)) {
      removeFromFavorites(crypto.id);
    } else {
      addToFavorites(crypto);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((cryptoId: string) => {
    return favorites.has(cryptoId);
  }, [favorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadUserFavorites,
  };
}