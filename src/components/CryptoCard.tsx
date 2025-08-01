import { useState } from "react";
import { Star, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface CryptoCardProps {
  crypto: CryptoData;
  isFavorite: boolean;
  onToggleFavorite: (crypto: CryptoData) => void;
  onViewChart: (crypto: CryptoData) => void;
}

export function CryptoCard({ crypto, isFavorite, onToggleFavorite, onViewChart }: CryptoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPositive = crypto.price_change_percentage_24h >= 0;
  const priceChangeColor = isPositive ? "price-positive" : "price-negative";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 8,
      }).format(price);
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  };

  return (
    <Card
      className="crypto-card slide-up cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewChart(crypto)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Crypto Icon & Rank */}
          <div className="relative">
            <img
              src={crypto.image}
              alt={crypto.name}
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/48/1f2937/ffffff?text=${crypto.symbol[0]}`;
              }}
            />
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-xs min-w-[24px] h-5 flex items-center justify-center"
            >
              #{crypto.market_cap_rank}
            </Badge>
          </div>

          {/* Crypto Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg truncate">{crypto.name}</h3>
              <span className="text-muted-foreground font-mono text-sm uppercase">
                {crypto.symbol}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-bold">
                {formatPrice(crypto.current_price)}
              </span>
            </div>

            {/* Price Change */}
            <div className={`flex items-center space-x-1 mt-1 ${priceChangeColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">
                {isPositive ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
              <span className="text-muted-foreground text-sm">24h</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-start space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(crypto);
            }}
            className="hover:bg-muted/50"
          >
            <Star
              className={`h-4 w-4 ${
                isFavorite
                  ? "fill-crypto-gold text-crypto-gold"
                  : "text-muted-foreground hover:text-crypto-gold"
              }`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-muted/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={() => onViewChart(crypto)}>
                View Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(crypto)}>
                {isFavorite ? "Remove from" : "Add to"} Favorites
              </DropdownMenuItem>
              <DropdownMenuItem>
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50">
        <div>
          <span className="text-muted-foreground text-sm">Market Cap</span>
          <p className="font-semibold">{formatMarketCap(crypto.market_cap)}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-sm">Volume (24h)</span>
          <p className="font-semibold">{formatVolume(crypto.total_volume)}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-sm">Circulating Supply</span>
          <p className="font-semibold text-sm">
            {new Intl.NumberFormat('en-US', {
              notation: 'compact',
              maximumFractionDigits: 2,
            }).format(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-sm">Max Supply</span>
          <p className="font-semibold text-sm">
            {crypto.max_supply
              ? `${new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 2,
                }).format(crypto.max_supply)} ${crypto.symbol.toUpperCase()}`
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Hover Effect */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-crypto-green/10 to-crypto-blue/10 pointer-events-none" />
      )}
    </Card>
  );
}