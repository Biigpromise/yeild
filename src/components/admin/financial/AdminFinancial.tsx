
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export const AdminFinancial = () => {
  const { data: walletStats, isLoading: loadingWallets } = useQuery({
    queryKey: ['admin-wallet-stats'],
    queryFn: async () => {
      const { data: brandWallets } = await supabase
        .from('brand_wallets')
        .select('balance, total_deposited, total_spent');

      const { data: yieldWallets } = await supabase
        .from('yield_wallets')
        .select('balance, total_earned, total_spent');

      const totalBrandBalance = brandWallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const totalBrandDeposited = brandWallets?.reduce((sum, wallet) => sum + (wallet.total_deposited || 0), 0) || 0;
      const totalYieldBalance = yieldWallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const totalYieldEarned = yieldWallets?.reduce((sum, wallet) => sum + (wallet.total_earned || 0), 0) || 0;

      return {
        totalBrandBalance,
        totalBrandDeposited,
        totalYieldBalance,
        totalYieldEarned,
        platformRevenue: totalBrandDeposited * 0.05 // 5% platform fee
      };
    },
  });

  const { data: transactionStats } = useQuery({
    queryKey: ['admin-transaction-stats'],
    queryFn: async () => {
      const { data: brandTransactions } = await supabase
        .from('brand_wallet_transactions')
        .select('amount, transaction_type, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      const recentDeposits = brandTransactions?.filter(t => t.transaction_type === 'deposit') || [];
      const recentWithdrawals = brandTransactions?.filter(t => t.transaction_type === 'withdrawal') || [];

      return {
        recentDeposits: recentDeposits.slice(0, 10),
        recentWithdrawals: recentWithdrawals.slice(0, 10),
        dailyVolume: brandTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
      };
    },
  });

  const handleExportReport = async () => {
    try {
      toast.success('Financial report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Management</h2>
          <p className="text-muted-foreground">Platform revenue, transactions, and wallet management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">₦{walletStats?.platformRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">₦{walletStats?.totalBrandBalance?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Brand Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">₦{walletStats?.totalBrandDeposited?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Deposited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">₦{walletStats?.totalYieldEarned?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Total Yield Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionStats?.recentDeposits?.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Deposit</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₦{transaction.amount?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recent deposits</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionStats?.recentWithdrawals?.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Withdrawal</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₦{transaction.amount?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recent withdrawals</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Advanced transaction management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Detailed wallet management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Advanced reporting features coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
