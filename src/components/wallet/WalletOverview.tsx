
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalHistory } from "./WithdrawalHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  Download,
  RefreshCw,
  Trophy,
  Target
} from "lucide-react";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { currencyService } from "@/services/currencyService";

interface WalletOverviewProps {
  userPoints: number;
  totalEarned: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  userPoints,
  totalEarned,
  pendingWithdrawals,
  completedWithdrawals
}) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    // Get user level for earning capacity calculation
    if (user) {
      userService.getCurrentUser().then(profile => {
        if (profile) {
          setUserLevel(profile.level || 1);
        }
      });
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh will be handled by parent component
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleWithdrawalSubmitted = () => {
    // This will be handled by parent component via callback
    window.location.reload();
  };

  const usdValue = currencyService.pointsToUSD(userPoints);
  const earningMultiplier = 1 + ((userLevel - 1) * 0.04); // 4% increase per level
  const nextLevelMultiplier = 1 + (userLevel * 0.04);

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">USD Value</p>
                <p className="text-2xl font-bold">${usdValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Level {userLevel}</p>
                <p className="text-lg font-bold">+{((earningMultiplier - 1) * 100).toFixed(0)}% Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Level</p>
                  <p className="text-lg font-bold">+{((nextLevelMultiplier - 1) * 100).toFixed(0)}% Earnings</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earning Information */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Complete Tasks</h4>
              <p className="text-sm text-blue-700">
                Earn points by completing various tasks. Your current earning rate is <strong>{(earningMultiplier * 100).toFixed(0)}%</strong> of base points due to your Level {userLevel} status.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Level Up Benefits</h4>
              <p className="text-sm text-green-700">
                Each level increases your earning capacity by 4%. Reach Level {userLevel + 1} to earn <strong>{(nextLevelMultiplier * 100).toFixed(0)}%</strong> of base task points!
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Exchange Rate</h4>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline">1000 points = $1 USD</Badge>
              <Badge variant="outline">Minimum withdrawal: 1000 points</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      <Tabs defaultValue="withdraw" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="withdraw">
          <WithdrawalForm 
            userPoints={userPoints} 
            onWithdrawalSubmitted={handleWithdrawalSubmitted}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <WithdrawalHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};
