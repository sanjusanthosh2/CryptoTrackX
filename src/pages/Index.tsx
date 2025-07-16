
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CryptoGrid } from '@/components/CryptoGrid';
import { SearchBar } from '@/components/SearchBar';
import { toast } from '@/hooks/use-toast';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

const Index = () => {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCryptoData = async () => {
    try {
      console.log('Fetching cryptocurrency data...');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data');
      }
      
      const data = await response.json();
      console.log('Crypto data fetched successfully:', data.length, 'coins');
      setCryptos(data);
      setFilteredCryptos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency data. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cryptos.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCryptos(filtered);
    } else {
      setFilteredCryptos(cryptos);
    }
  }, [searchTerm, cryptos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            CryptoTrackX
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track real-time cryptocurrency prices, monitor market trends, and stay ahead of the market
          </p>
        </div>

        <div className="mb-8">
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            totalCoins={cryptos.length}
          />
        </div>

        <CryptoGrid 
          cryptos={filteredCryptos} 
          loading={loading}
          onRefresh={fetchCryptoData}
        />
      </main>
    </div>
  );
};

export default Index;
