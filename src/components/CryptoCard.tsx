
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';

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

interface CryptoCardProps {
  crypto: CryptoData;
  onClick: () => void;
}

export const CryptoCard = ({ crypto, onClick }: CryptoCardProps) => {
  const isPositive = crypto.price_change_percentage_24h > 0;
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();
  
  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      return;
    }

    if (isFavorite(crypto.id)) {
      removeFromFavorites(crypto.id);
    } else {
      addToFavorites(crypto);
    }
  };

  return (
    <div 
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer hover:transform hover:scale-105 group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={crypto.image} 
            alt={crypto.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {crypto.name}
            </h3>
            <p className="text-sm text-gray-400 uppercase">
              {crypto.symbol}
            </p>
          </div>
        </div>
        
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              isFavorite(crypto.id) 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-400 hover:text-yellow-400'
            }`}
            onClick={handleFavoriteClick}
          >
            <Star 
              className={`h-4 w-4 ${isFavorite(crypto.id) ? 'fill-current' : ''}`} 
            />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            {formatPrice(crypto.current_price)}
          </span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
            isPositive 
              ? 'bg-emerald-900/50 text-emerald-400' 
              : 'bg-red-900/50 text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Market Cap</p>
            <p className="text-white font-medium">
              {formatMarketCap(crypto.market_cap)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Volume</p>
            <p className="text-white font-medium">
              {formatMarketCap(crypto.total_volume)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
