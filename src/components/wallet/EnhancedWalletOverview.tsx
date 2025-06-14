
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { currencyService } from "@/services/currencyService";

interface EnhancedWalletOverviewProps {
  userPoints: number;
  onRefresh: () => void;
}

export const EnhancedWalletOverview = ({ userPoints, onRefresh }: EnhancedWalletOverviewProps) => {
  const { user } = useAuth();
  const [yieldWallet, setYieldWallet] = useState<any>(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [yieldTransactions, setYieldTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalReadiness, setWithdrawalReadiness] = useState({
    canWithdraw: false,
    methodsConfigured: 0,
    totalMethods: 4
  });

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      // Load yield wallet
      const { data: yieldData } = await supabase
        .from('yield_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (yieldData) {
        setYieldWallet(yieldData);
      }

      // Load recent withdrawals
      const { data: withdrawalData } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (withdrawalData) {
        setRecentWithdrawals(withdrawalData);
      }

      // Load yield wallet transactions
      const { data: yieldTransactionData } = await supabase
        .from('yield_wallet_transactions')
        .select(`
          *,
          yield_wallets!inner(user_id)
        `)
        .eq('yield_wallets.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (yieldTransactionData) {
        setYieldTransactions(yieldTransactionData);
      }

      // Check withdrawal readiness
      const { data: cryptoData } = await supabase
        .from('crypto_addresses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const methodsConfigured = (cryptoData?.length || 0) > 0 ? 3 : 2; // crypto + gift cards + yield wallet always available
      const canWithdraw = userPoints >= 100; // minimum withdrawal amount

      setWithdrawalReadiness({
        canWithdraw,
        methodsConfigured,
        totalMethods: 4
      });

    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const usdValue = currencyService.pointsToUSD(userPoints);
  const yieldUsdValue = currencyService.pointsToUSD(yieldWallet?.balance || 0);
  const totalBalance = userPoints + (yieldWallet?.balance || 0);
  const totalUsdValue = currencyService.pointsToUSD(totalBalance);

  return (
    <div className="space-y-4">
      {/* Main Balance Cards with USD Prominence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-2 ${withdrawalReadiness.canWithdraw ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Wallet className="h-8 w-8 text-blue-500" />
                  {withdrawalReadiness.canWithdraw && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Main Balance</p>
                  <p className="text-3xl font-bold text-green-600">${usdValue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{userPoints.toLocaleString()} points</p>
                </div>
              </div>
              {withdrawalReadiness.canWithdraw && (
                <Badge variant="default" className="bg-green-500">
                  Ready
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Yield Wallet</p>
                <p className="text-2xl font-bold text-purple-600">${yieldUsdValue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{(yieldWallet?.balance || 0).toLocaleString()} points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-3xl font-bold text-blue-600">${totalUsdValue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{totalBalance.toLocaleString()} points</p>
                </div>
              </div>
              <div className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <div className="text-xs text-muted-foreground mt-1">
                  {withdrawalReadiness.methodsConfigured}/{withdrawalReadiness.totalMethods} methods
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Withdrawals */}
        {recentWithdrawals.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Recent Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium capitalize">
                        {withdrawal.payout_method.replace('_', ' ')}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">
                        -${currencyService.pointsToUSD(withdrawal.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {withdrawal.amount.toLocaleString()} pts
                      </div>
                      <Badge 
                        variant={
                          withdrawal.status === 'completed' ? 'default' :
                          withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs mt-1"
                      >
                        {withdrawal.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yield Wallet Transactions */}
        {yieldTransactions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Yield Wallet Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yieldTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="text-sm font-medium capitalize">
                        {transaction.transaction_type.replace('_', ' ')}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {transaction.description || 'Platform transaction'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${currencyService.pointsToUSD(transaction.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for New Users */}
        {recentWithdrawals.length === 0 && yieldTransactions.length === 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete tasks and make withdrawals to see activity here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Withdrawal Readiness Indicator */}
      {!withdrawalReadiness.canWithdraw && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {userPoints < 100 
                    ? `Need ${100 - userPoints} more points to withdraw` 
                    : 'Ready to withdraw!'}
                </p>
                <p className="text-xs text-orange-600">
                  Minimum withdrawal: 100 points (${currencyService.pointsToUSD(100).toFixed(2)})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
