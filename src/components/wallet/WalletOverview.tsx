import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalHistory } from "./WithdrawalHistory";
import { EnhancedWalletOverview } from "./EnhancedWalletOverview";
import { EnhancedBankAccountSelector } from "./EnhancedBankAccountSelector";
import { QuickWithdrawalActions } from "./QuickWithdrawalActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { 
  Wallet, 
  TrendingUp, 
  Download,
  RefreshCw,
  Trophy,
  Target,
  Settings
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
  const [activeTab, setActiveTab] = useState("overview");

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

  const handleSetupPaymentMethod = (method: string) => {
    setActiveTab("withdraw");
  };

  const handleStartWithdrawal = (method: string) => {
    setActiveTab("withdraw");
  };

  const usdValue = currencyService.pointsToUSD(userPoints);
  const earningMultiplier = 1 + ((userLevel - 1) * 0.04); // 4% increase per level
  const nextLevelMultiplier = 1 + (userLevel * 0.04);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Enhanced Wallet Summary */}
        <EnhancedWalletOverview 
          userPoints={userPoints} 
          onRefresh={handleRefresh}
        />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedBankAccountSelector />
          <QuickWithdrawalActions 
            userPoints={userPoints}
            onStartWithdrawal={handleStartWithdrawal}
          />
        </div>

        {/* Legacy Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Level</p>
                  <p className="text-lg font-bold">+{((nextLevelMultiplier - 1) * 100).toFixed(0)}% Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Settings</p>
                    <p className="text-lg font-bold">Configure</p>
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

        {/* Wallet Actions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 text-center">
                <Wallet className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Wallet Overview</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your points, set up payment methods, and track your withdrawals.
                </p>
                <Button onClick={() => setActiveTab("withdraw")}>
                  Start Withdrawal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
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
    </ErrorBoundary>
  );
};
