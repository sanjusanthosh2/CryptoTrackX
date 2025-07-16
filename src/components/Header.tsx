
import { useState } from 'react';
import { TrendingUp, BarChart3, Star, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const Header = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate('/');
    }
  };

  return (
    <>
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CryptoTrackX</h1>
                <p className="text-sm text-gray-400">Real-time Crypto Tracker</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-slate-800"
                onClick={() => navigate('/')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              {user && (
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white hover:bg-slate-800"
                  onClick={() => navigate('/favorites')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Favorites
                </Button>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In
                </Button>
              )}
            </nav>

            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Menu
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </>
  );
};
