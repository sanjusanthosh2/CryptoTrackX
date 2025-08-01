import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";

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

export function useCryptoData() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCryptoData = useCallback(async () => {
    try {
      setError(null);
      
      const data: CryptoData[] = await apiService.getCryptoMarkets();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setCryptos(data);
        setLastUpdated(new Date());
      } else {
        console.error("API returned non-array data:", data);
        setError("Invalid data format received from API");
      }
    } catch (err: any) {
      console.error("Failed to fetch crypto data:", err);
      setError(err.message || "Failed to load cryptocurrency data. Please check your connection and try again.");
      // Keep cryptos as empty array on error
      setCryptos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCryptoData();
  }, [fetchCryptoData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchCryptoData();
  }, [fetchCryptoData]);

  return {
    cryptos,
    isLoading,
    error,
    lastUpdated,
    refetch,
  };
}