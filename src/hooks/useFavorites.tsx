
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  crypto_id: string;
  crypto_name: string;
  crypto_symbol: string;
  crypto_image: string | null;
  current_price: number | null;
  added_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const addToFavorites = async (crypto: {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        crypto_id: crypto.id,
        crypto_name: crypto.name,
        crypto_symbol: crypto.symbol,
        crypto_image: crypto.image,
        current_price: crypto.current_price,
      });

      if (error) throw error;

      toast({
        title: "Added to favorites",
        description: `${crypto.name} has been added to your favorites`,
      });

      fetchFavorites();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already in favorites",
          description: `${crypto.name} is already in your favorites`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
      }
    }
  };

  const removeFromFavorites = async (cryptoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('crypto_id', cryptoId);

      if (error) throw error;

      toast({
        title: "Removed from favorites",
        description: "Cryptocurrency removed from your favorites",
      });

      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (cryptoId: string) => {
    return favorites.some((fav) => fav.crypto_id === cryptoId);
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refetch: fetchFavorites,
  };
};
