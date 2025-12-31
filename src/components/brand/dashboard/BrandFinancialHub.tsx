import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBrandCampaigns } from '@/hooks/useBrandCampaigns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, CreditCard, Download, Calendar } from 'lucide-react';
import { BudgetEstimateCalculator } from '@/components/brand/BudgetEstimateCalculator';

export const BrandFinancialHub = () => {
  const { campaigns } = useBrandCampaigns();

  const { data: wallet } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['brand-wallet-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_wallet_transactions')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const financialMetrics = {
    totalSpent: campaigns?.reduce((sum, campaign) => sum + Number(campaign.budget), 0) || 0,
    activeSpend: campaigns?.filter(c => c.status === 'active').reduce((sum, campaign) => sum + Number(campaign.budget), 0) || 0,
    avgCampaignCost: campaigns?.length ? (campaigns.reduce((sum, campaign) => sum + Number(campaign.budget), 0) / campaigns.length) : 0,
    pendingPayments: campaigns?.filter(c => c.payment_status === 'pending').length || 0
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'campaign_charge':
        return <CreditCard className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Wallet Deposit';
      case 'campaign_charge':
        return 'Campaign Charge';
      case 'refund':
        return 'Refund';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Financial Hub</h1>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{wallet?.balance?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Available for campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{financialMetrics.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Spend</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{financialMetrics.activeSpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Currently running campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Campaign Cost</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{Math.round(financialMetrics.avgCampaignCost).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per campaign average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Calculator for Brands */}
      <BudgetEstimateCalculator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium">{formatTransactionType(transaction.transaction_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}₦{Number(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: ₦{Number(transaction.balance_after).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {!transactions?.length && (
                <p className="text-center text-muted-foreground py-4">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns?.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{campaign.title}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <Badge variant={campaign.payment_status === 'paid' ? 'default' : 'destructive'}>
                        {campaign.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{Number(campaign.budget).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {!campaigns?.length && (
                <p className="text-center text-muted-foreground py-4">No campaigns yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};