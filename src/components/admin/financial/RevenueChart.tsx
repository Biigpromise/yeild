import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface RevenueData {
  date: string;
  revenue: number;
  payments: number;
  fees: number;
  withdrawals: number;
  paymentCount: number;
  withdrawalCount: number;
}

export const RevenueChart: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'revenue' | 'volume'>('revenue');

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Get last 30 days of revenue data
      const startDate = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from('company_revenue')
        .select('*')
        .gte('revenue_date', format(startDate, 'yyyy-MM-dd'))
        .order('revenue_date', { ascending: true });

      if (error) throw error;

      const formattedData: RevenueData[] = (data || []).map(item => ({
        date: format(new Date(item.revenue_date), 'MMM dd'),
        revenue: Number(item.net_revenue) || 0,
        payments: Number(item.total_payments) || 0,
        fees: Number(item.total_fees) || 0,
        withdrawals: Number(item.total_withdrawals) || 0,
        paymentCount: item.payment_count || 0,
        withdrawalCount: item.withdrawal_count || 0
      }));

      setRevenueData(formattedData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact'
    }).format(value);
  };

  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalPayments = revenueData.reduce((sum, day) => sum + day.payments, 0);
  const totalFees = revenueData.reduce((sum, day) => sum + day.fees, 0);
  const avgDailyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Revenue (30d)
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Payments (30d)
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPayments)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Total Fees (30d)
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalFees)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              Avg Daily Revenue
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(avgDailyRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Revenue Analytics (Last 30 Days)
            <div className="flex gap-2">
              <Badge 
                variant={chartType === 'revenue' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setChartType('revenue')}
              >
                Revenue
              </Badge>
              <Badge 
                variant={chartType === 'volume' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setChartType('volume')}
              >
                Volume
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'revenue' ? (
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fees" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Fees"
                  />
                </LineChart>
              ) : (
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="paymentCount" 
                    fill="#10b981" 
                    name="Payments"
                  />
                  <Bar 
                    dataKey="withdrawalCount" 
                    fill="#ef4444" 
                    name="Withdrawals"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};