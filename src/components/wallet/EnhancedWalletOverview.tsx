import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { currencyService } from '@/services/currencyService';
interface EnhancedWalletOverviewProps {
  userPoints: number;
  onRefresh: () => void;
}
export const EnhancedWalletOverview: React.FC<EnhancedWalletOverviewProps> = ({
  userPoints,
  onRefresh
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };
  const usdValue = currencyService.pointsToUSD(userPoints);
  return <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 bg-gray-950">
      <CardHeader className="bg-neutral-950">
        <div className="flex items-center justify-between bg-slate-950">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Enhanced Wallet
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 bg-neutral-950">
        {/* Main Balance Display */}
        <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-blue-100">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {showBalance ? `${userPoints.toLocaleString()}` : '•••••••'}
          </div>
          <div className="text-lg text-blue-500 mb-1">Points</div>
          <div className="text-sm text-muted-foreground bg-slate-950">
            ≈ ${showBalance ? usdValue : '•••'} USD
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {showBalance ? userPoints.toLocaleString() : '•••'}
            </div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center p-4 bg-white/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {showBalance ? '0' : '•••'}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="p-4 bg-white/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Exchange Rate</span>
            </div>
            <Badge variant="secondary">1000 pts = $1 USD</Badge>
          </div>
        </div>
      </CardContent>
    </Card>;
};