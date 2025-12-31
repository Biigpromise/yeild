import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Wallet, TrendingUp, Eye, EyeOff, RefreshCw, HelpCircle } from 'lucide-react';
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
  const nairaValue = userPoints; // 1 point = ₦1

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            My Wallet
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">Your points balance. 1 point = ₦1 NGN. Earn points by completing tasks and referring friends.</p>
              </TooltipContent>
            </Tooltip>
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
      <CardContent className="space-y-4">
        {/* Main Balance Display - Simplified */}
        <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
          <div className="text-4xl font-bold text-primary mb-1">
            {showBalance ? `${userPoints.toLocaleString()}` : '•••••••'}
          </div>
          <div className="text-lg text-primary/80 font-medium">Points</div>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>≈ ₦{showBalance ? nairaValue.toLocaleString() : '•••'}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>${showBalance ? usdValue : '•••'} USD</span>
          </div>
        </div>

        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {showBalance ? userPoints.toLocaleString() : '•••'}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xl font-bold text-amber-600">0</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Exchange Rate - Simplified */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium">Rate</span>
            </div>
            <Badge variant="outline" className="text-xs">1 pt = ₦1 = $0.001</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};