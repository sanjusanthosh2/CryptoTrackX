import { CryptoCard } from "./CryptoCard";
import { NetworkStatus } from "./NetworkStatus";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface CryptoGridProps {
  cryptos: CryptoData[];
  isLoading: boolean;
  error: string | null;
  favorites: Set<string>;
  onToggleFavorite: (crypto: CryptoData) => void;
  onViewChart: (crypto: CryptoData) => void;
  showFavorites: boolean;
}

export function CryptoGrid({
  cryptos,
  isLoading,
  error,
  favorites,
  onToggleFavorite,
  onViewChart,
  showFavorites,
}: CryptoGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-crypto-green" />
          <p className="text-muted-foreground">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert className="border-crypto-red/20 bg-crypto-red/10">
          <AlertDescription className="text-crypto-red">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter cryptos based on showFavorites flag
  const displayCryptos = showFavorites
    ? cryptos.filter(crypto => favorites.has(crypto.id))
    : cryptos;

  if (showFavorites && displayCryptos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">⭐</span>
          </div>
          <h3 className="text-xl font-semibold">No Favorites Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start building your watchlist by clicking the star icon on any cryptocurrency card.
          </p>
        </div>
      </div>
    );
  }

  if (displayCryptos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold">No Results Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {showFavorites ? "Your Favorites" : "Cryptocurrency Prices"}
          </h2>
          <p className="text-muted-foreground">
            {showFavorites
              ? `${displayCryptos.length} favorite${displayCryptos.length !== 1 ? 's' : ''}`
              : `Top ${displayCryptos.length} cryptocurrencies by market cap`}
          </p>
        </div>
        
        {/* Network Status */}
        <div className="hidden sm:flex items-center space-x-2">
          <NetworkStatus />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayCryptos.map((crypto, index) => (
          <div
            key={crypto.id}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <CryptoCard
              crypto={crypto}
              isFavorite={favorites.has(crypto.id)}
              onToggleFavorite={onToggleFavorite}
              onViewChart={onViewChart}
            />
          </div>
        ))}
      </div>

      {/* Load More Indicator */}
      {!showFavorites && displayCryptos.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Showing top {displayCryptos.length} cryptocurrencies
          </p>
        </div>
      )}
    </div>
  );
}