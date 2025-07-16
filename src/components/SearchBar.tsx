
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCoins: number;
  onRefresh?: () => void;
}

export const SearchBar = ({ searchTerm, onSearchChange, totalCoins, onRefresh }: SearchBarProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span>Tracking {totalCoins} coins</span>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
