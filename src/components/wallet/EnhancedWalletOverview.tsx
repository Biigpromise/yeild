
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
  const [refreshing, setRefreshing] = useState(false);

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
  const totalBalance = userPoints + (yieldWallet?.balance || 0);

  return (
    <div className="space-y-4">
      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Main Balance</p>
                  <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">${usdValue.toFixed(2)} USD</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Yield Wallet</p>
                <p className="text-2xl font-bold">{(yieldWallet?.balance || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Platform features</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{totalBalance.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Combined balance</p>
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

      {/* Recent Activity */}
      {recentWithdrawals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="text-sm font-medium capitalize">
                      {withdrawal.payout_method.replace('_', ' ')}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {withdrawal.amount.toLocaleString()} pts
                    </div>
                    <Badge 
                      variant={
                        withdrawal.status === 'completed' ? 'default' :
                        withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
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
    </div>
  );
};
