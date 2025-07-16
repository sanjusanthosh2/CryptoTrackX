
import { useEffect } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { CryptoCard } from './CryptoCard';

export const FavoritesPage = () => {
  const { favorites, loading } = useFavorites();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Sign in to view your favorites
          </h1>
          <p className="text-gray-300">
            Create an account or sign in to save your favorite cryptocurrencies
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">My Favorites</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          My Favorites ({favorites.length})
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-300 mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-400">
              Start adding cryptocurrencies to your favorites from the main dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <CryptoCard
                key={favorite.id}
                crypto={{
                  id: favorite.crypto_id,
                  name: favorite.crypto_name,
                  symbol: favorite.crypto_symbol,
                  current_price: favorite.current_price || 0,
                  price_change_percentage_24h: 0,
                  market_cap: 0,
                  total_volume: 0,
                  image: favorite.crypto_image || '',
                }}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
