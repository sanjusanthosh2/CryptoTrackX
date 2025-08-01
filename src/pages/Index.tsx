import { useState } from "react";
import { Header } from "@/components/Header";
import { CryptoGrid } from "@/components/CryptoGrid";
import { CryptoChart } from "@/components/CryptoChart";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useFavorites } from "@/hooks/useFavorites";

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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [showChart, setShowChart] = useState(false);

  const { cryptos, isLoading, error } = useCryptoData();
  const { favorites, toggleFavorite } = useFavorites();

  // Filter cryptos based on search query
  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewChart = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setShowChart(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites(!showFavorites)}
      />

      <main className="container mx-auto px-4 py-8">
        <CryptoGrid
          cryptos={filteredCryptos}
          isLoading={isLoading}
          error={error}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onViewChart={handleViewChart}
          showFavorites={showFavorites}
        />
      </main>

      <CryptoChart
        crypto={selectedCrypto}
        isOpen={showChart}
        onClose={() => setShowChart(false)}
      />
    </div>
  );
};

export default Index;
