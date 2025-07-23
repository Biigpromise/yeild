import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RevenueChart } from './RevenueChart';
import { TransfersList } from './TransfersList';
import { SettlementSchedules } from './SettlementSchedules';

interface FinancialStats {
  todayRevenue: number;
  totalFees: number;
  pendingTransfers: number;
  pendingAmount: number;
  totalPayments: number;
  totalWithdrawals: number;
}

export const FinancialDashboard: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats>({
    todayRevenue: 0,
    totalFees: 0,
    pendingTransfers: 0,
    pendingAmount: 0,
    totalPayments: 0,
    totalWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadFinancialData();
    setupRealtimeUpdates();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Get today's revenue
      const today = new Date().toISOString().split('T')[0];
      const { data: revenueData } = await supabase
        .from('company_revenue')
        .select('*')
        .eq('revenue_date', today)
        .single();

      // Get pending transfers
      const { data: pendingTransfers } = await supabase
        .from('fund_transfers')
        .select('net_amount')
        .eq('status', 'pending');

      const pendingAmount = pendingTransfers?.reduce(
        (sum, transfer) => sum + Number(transfer.net_amount), 0
      ) || 0;

      setStats({
        todayRevenue: revenueData?.net_revenue || 0,
        totalFees: revenueData?.total_fees || 0,
        pendingTransfers: pendingTransfers?.length || 0,
        pendingAmount,
        totalPayments: revenueData?.total_payments || 0,
        totalWithdrawals: revenueData?.total_withdrawals || 0
      });

    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('financial-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_revenue'
        },
        () => loadFinancialData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fund_transfers'
        },
        () => loadFinancialData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const triggerManualSettlement = async () => {
    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('process-settlements', {
        body: { manualTrigger: true }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        loadFinancialData();
      } else {
        toast.error(data.error || 'Settlement failed');
      }
    } catch (error) {
      console.error('Settlement error:', error);
      toast.error('Failed to process settlement');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fees collected today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              Processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlement</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTransfers} transfers waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground">
              Paid out today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Settlement Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Settlement Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Manually trigger settlement of pending transfers
              </p>
              <Badge variant="outline" className="mt-1">
                Minimum: ₦5,000
              </Badge>
            </div>
            <Button 
              onClick={triggerManualSettlement}
              disabled={processing || stats.pendingAmount < 5000}
              className="flex items-center gap-2"
            >
              {processing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {processing ? 'Processing...' : 'Settle Now'}
            </Button>
          </div>
          
          {stats.pendingAmount < 5000 && stats.pendingAmount > 0 && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Pending amount is below minimum settlement threshold
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs defaultValue="transfers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transfers">Fund Transfers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="schedules">Settlement Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers">
          <TransfersList />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueChart />
        </TabsContent>

        <TabsContent value="schedules">
          <SettlementSchedules />
        </TabsContent>
      </Tabs>
    </div>
  );
};