
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Target,
  Award
} from 'lucide-react';

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

  const usdValue = userPoints / 1000; // 1000 points = $1
  const nextMilestone = Math.ceil(userPoints / 1000) * 1000;
  const progressToNextMilestone = ((userPoints % 1000) / 1000) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Your Wallet
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Balance Display */}
        <div className="text-center p-6 bg-white/50 rounded-xl">
          <div className="text-4xl font-bold text-primary mb-2">
            {showBalance ? `${userPoints.toLocaleString()}` : '••••••'}
            <span className="text-lg font-normal text-muted-foreground ml-2">Points</span>
          </div>
          <div className="text-lg text-muted-foreground">
            {showBalance ? `≈ $${usdValue.toFixed(2)} USD` : '••••••'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold">
                {showBalance ? `$${usdValue.toFixed(2)}` : '••••'}
              </div>
              <div className="text-sm text-muted-foreground">USD Value</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold">
                {showBalance ? nextMilestone.toLocaleString() : '••••'}
              </div>
              <div className="text-sm text-muted-foreground">Next Milestone</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-xl font-bold">
                {showBalance ? `${progressToNextMilestone.toFixed(0)}%` : '••••'}
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">
                {showBalance ? Math.floor(userPoints / 1000) : '••••'}
              </div>
              <div className="text-sm text-muted-foreground">Dollars Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next milestone</span>
            <span>{showBalance ? `${progressToNextMilestone.toFixed(0)}%` : '••••'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: showBalance ? `${progressToNextMilestone}%` : '0%' }}
            />
          </div>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Exchange Rate</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>1,000 Points = $1.00 USD</div>
              <div>Minimum withdrawal: 1,000 points</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Available Methods</h4>
            <div className="space-y-1 text-sm text-green-700">
              <div>• Bank Transfer (Nigeria)</div>
              <div>• Yield Wallet (Instant)</div>
              <div>• Crypto (Coming Soon)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
