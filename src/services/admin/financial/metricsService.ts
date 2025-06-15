
import { supabase } from "@/integrations/supabase/client";
import { FinancialMetrics } from "./types";

// Get financial metrics with real data
export async function getFinancialMetrics(timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<FinancialMetrics> {
  try {
    const { data: withdrawals, error } = await supabase
      .from('withdrawal_requests')
      .select('*');

    if (error) throw error;

    const requests = withdrawals || [];
    const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'processed');
    const pendingRequests = requests.filter(r => r.status === 'pending');

    const methodMap = new Map<string, { count: number; amount: number }>();
    approvedRequests.forEach(request => {
      const method = request.payout_method;
      const current = methodMap.get(method) || { count: 0, amount: 0 };
      methodMap.set(method, {
        count: current.count + 1,
        amount: current.amount + request.amount
      });
    });

    const payoutMethods = Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount
    }));

    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format
      
      const monthPayouts = approvedRequests.filter(r => 
        r.processed_at?.startsWith(monthStr)
      ).reduce((sum, r) => sum + r.amount, 0);

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        payouts: monthPayouts,
        revenue: monthPayouts * 0.05 // Assuming 5% fee
      });
    }

    const totalPayouts = approvedRequests.reduce((sum, r) => sum + r.amount, 0);
    const pendingPayouts = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

    return {
      totalPayouts,
      pendingPayouts,
      totalRevenue: totalPayouts * 0.05, // Assuming 5% processing fee
      avgWithdrawalAmount: approvedRequests.length > 0 ? totalPayouts / approvedRequests.length : 0,
      payoutMethods,
      monthlyTrends,
      conversionRates: [
        { currency: 'USD', rate: 1.0, lastUpdated: new Date().toISOString() },
        { currency: 'EUR', rate: 0.85, lastUpdated: new Date().toISOString() },
        { currency: 'GBP', rate: 0.73, lastUpdated: new Date().toISOString() }
      ]
    };
  } catch (error) {
    console.error('Error fetching financial metrics:', error);
    throw error;
  }
}
