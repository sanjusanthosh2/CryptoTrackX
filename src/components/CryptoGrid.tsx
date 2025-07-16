
import { useState } from 'react';
import { CryptoCard } from './CryptoCard';
import { CryptoChart } from './CryptoChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface CryptoGridProps {
  cryptos: CryptoData[];
  loading: boolean;
  onRefresh: () => void;
}

export const CryptoGrid = ({ cryptos, loading, onRefresh }: CryptoGridProps) => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  const handleCryptoClick = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setChartOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 animate-pulse"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-20"></div>
                <div className="h-3 bg-slate-700 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-slate-700 rounded w-24"></div>
              <div className="h-4 bg-slate-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cryptos.map((crypto) => (
          <CryptoCard
            key={crypto.id}
            crypto={crypto}
            onClick={() => handleCryptoClick(crypto)}
          />
        ))}
      </div>

      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-3">
              {selectedCrypto && (
                <>
                  <img 
                    src={selectedCrypto.image} 
                    alt={selectedCrypto.name}
                    className="w-8 h-8"
                  />
                  <span>{selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCrypto && (
            <CryptoChart cryptoId={selectedCrypto.id} cryptoName={selectedCrypto.name} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
