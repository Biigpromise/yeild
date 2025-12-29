import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletOverview } from '@/components/wallet/WalletOverview';
import { EnhancedWalletOverview } from '@/components/wallet/EnhancedWalletOverview';
import { WithdrawalForm } from '@/components/wallet/WithdrawalForm';
import { WithdrawalHistory } from '@/components/wallet/WithdrawalHistory';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { Wallet as WalletIcon, TrendingUp, Download, RefreshCw, DollarSign, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
const Wallet: React.FC = () => {
  const {
    user
  } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [completedWithdrawals, setCompletedWithdrawals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);
  const loadWalletData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Get user profile data
      const profile = await userService.getUserProfile(user.id);
      if (profile) {
        setUserPoints(profile.points || 0);
        setTotalEarned(profile.points || 0); // Use points as total earned for now
      }

      // Get withdrawal statistics
      const {
        data: withdrawals
      } = await supabase.from('withdrawal_requests').select('status, amount').eq('user_id', user.id);
      if (withdrawals) {
        const pending = withdrawals.filter(w => w.status === 'pending').length;
        const completed = withdrawals.filter(w => w.status === 'completed').length;
        setPendingWithdrawals(pending);
        setCompletedWithdrawals(completed);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = () => {
    loadWalletData();
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your wallet...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-green-500/20 to-blue-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12 bg-neutral-950">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
              <WalletIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
                Your Wallet
              </h1>
            </div>
            <p className="text-sm sm:text-lg max-w-2xl mx-auto text-slate-50 px-2">
              Manage your earnings, withdrawals, and transactions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 sm:pt-4">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
                <DollarSign className="h-3 w-3" />
                {userPoints.toLocaleString()} Points
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3" />
                Growing Balance
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-zinc-950">
        {/* Balance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-3 sm:p-6 bg-neutral-950">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Available Balance</p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {showBalance ? <p className="text-xl sm:text-3xl font-bold truncate">{userPoints.toLocaleString()}</p> : <p className="text-xl sm:text-3xl font-bold">••••</p>}
                    <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      {showBalance ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="p-2 sm:p-3 bg-primary/20 rounded-full shrink-0">
                  <WalletIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-3 sm:p-6 bg-zinc-950">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Total Earned</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600 truncate">{totalEarned.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-full shrink-0">
                  <ArrowUpRight className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-3 sm:p-6 bg-neutral-950">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Pending</p>
                  <p className="text-xl sm:text-3xl font-bold text-orange-600">{pendingWithdrawals}</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-500/20 rounded-full shrink-0">
                  <Download className="h-4 w-4 sm:h-6 sm:w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-3 sm:p-6 bg-neutral-950">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Completed</p>
                  <p className="text-xl sm:text-3xl font-bold text-blue-600">{completedWithdrawals}</p>
                  <p className="text-xs text-muted-foreground">Withdrawals</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full shrink-0">
                  <ArrowDownRight className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Withdraw Funds</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Cash out your earnings
              </p>
              <Button className="w-full text-sm" size="sm">
                Start Withdrawal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-500/20 transition-colors">
                <PiggyBank className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Yield Wallet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Save points before withdrawing
              </p>
              <Button variant="outline" className="w-full text-sm" size="sm">
                Transfer
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-blue-500/20 transition-colors">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Payment Methods</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Manage bank accounts
              </p>
              <Button variant="outline" className="w-full text-sm" size="sm">
                Manage
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Wallet Interface */}
        <WalletOverview userPoints={userPoints} totalEarned={totalEarned} pendingWithdrawals={pendingWithdrawals} completedWithdrawals={completedWithdrawals} />
      </div>
    </div>;
};
export default Wallet;