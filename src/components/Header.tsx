import { useState } from "react";
import { Search, Star, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthModal } from "./AuthModal";
import { NetworkStatus } from "./NetworkStatus";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

export function Header({ onSearch, searchQuery, showFavorites, onToggleFavorites }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-crypto-green to-crypto-blue flex items-center justify-center">
                <span className="text-background font-bold text-lg">₿</span>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:inline">
                CryptoTracker
              </span>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-muted-foreground/20"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={onToggleFavorites}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Favorites
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="gap-2 bg-gradient-to-r from-crypto-green to-crypto-blue text-background hover:opacity-90"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 bg-muted/50 border-muted-foreground/20"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 space-y-4 pb-4 border-t border-border pt-4">
              <Button
                variant={showFavorites ? "default" : "outline"}
                className="w-full gap-2"
                onClick={onToggleFavorites}
              >
                <Star className="h-4 w-4" />
                Favorites
              </Button>

              {user ? (
                <div className="space-y-2">
                  <div className="text-center text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-crypto-green to-crypto-blue text-background hover:opacity-90"
                  onClick={() => setShowAuthModal(true)}
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}