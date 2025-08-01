import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiService } from "@/services/api";

interface ChartData {
  timestamp: number;
  price: number;
  date: string;
}

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  image: string;
}

interface CryptoChartProps {
  crypto: CryptoData | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeframes = [
  { label: "7D", days: "7" },
  { label: "30D", days: "30" },
  { label: "90D", days: "90" },
  { label: "1Y", days: "365" },
];

export function CryptoChart({ crypto, isOpen, onClose }: CryptoChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (crypto && isOpen) {
      fetchChartData(crypto.id, selectedTimeframe);
    }
  }, [crypto, selectedTimeframe, isOpen]);

  const fetchChartData = async (cryptoId: string, days: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getCryptoChart(cryptoId, days);
      
      const formattedData: ChartData[] = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString(),
      }));

      setChartData(formattedData);
    } catch (err: any) {
      setError(err.message || "Failed to load chart data. Please try again later.");
      console.error("Chart data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const calculatePriceChange = () => {
    if (chartData.length < 2) return { change: 0, percentage: 0 };
    
    const firstPrice = chartData[0]?.price || 0;
    const lastPrice = chartData[chartData.length - 1]?.price || 0;
    const change = lastPrice - firstPrice;
    const percentage = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
    
    return { change, percentage };
  };

  const { change, percentage } = calculatePriceChange();
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  if (!crypto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 glass-card border-crypto-green/20">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <DialogTitle className="text-2xl gradient-text">
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">
                    Rank #{crypto.market_cap_rank}
                  </Badge>
                  <span className="text-3xl font-bold">
                    {formatPrice(crypto.current_price)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 space-y-6">
          {/* Timeframe Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe.days}
                  variant={selectedTimeframe === timeframe.days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.days)}
                  className="min-w-[60px]"
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>

            {/* Price Change */}
            {chartData.length > 0 && (
              <div className={`flex items-center space-x-2 ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
                <TrendIcon className="h-5 w-5" />
                <span className="font-semibold">
                  {isPositive ? '+' : ''}{formatPrice(Math.abs(change))}
                </span>
                <span className="text-sm">
                  ({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          {/* Chart */}
          <Card className="h-96 p-4 bg-muted/20">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-crypto-green" />
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <p className="text-crypto-red">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchChartData(crypto.id, selectedTimeframe)}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-card p-3 border border-border/50">
                            <p className="text-sm text-muted-foreground">{label}</p>
                            <p className="font-semibold">
                              {formatPrice(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "hsl(var(--crypto-green))" : "hsl(var(--crypto-red))"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "hsl(var(--crypto-green))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No chart data available</p>
              </div>
            )}
          </Card>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <p className="text-muted-foreground text-sm">24h Change</p>
              <p className={`font-semibold ${crypto.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-muted-foreground text-sm">Period Low</p>
              <p className="font-semibold">
                {chartData.length > 0 ? formatPrice(Math.min(...chartData.map(d => d.price))) : 'N/A'}
              </p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-muted-foreground text-sm">Period High</p>
              <p className="font-semibold">
                {chartData.length > 0 ? formatPrice(Math.max(...chartData.map(d => d.price))) : 'N/A'}
              </p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-muted-foreground text-sm">Data Points</p>
              <p className="font-semibold">{chartData.length}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}