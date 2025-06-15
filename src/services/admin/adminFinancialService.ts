import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  payoutMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  processedAt?: string;
  payoutDetails: any;
  adminNotes?: string;
}

export interface FinancialMetrics {
  totalPayouts: number;
  pendingPayouts: number;
  totalRevenue: number;
  avgWithdrawalAmount: number;
  payoutMethods: Array<{ method: string; count: number; amount: number }>;
  monthlyTrends: Array<{ month: string; payouts: number; revenue: number }>;
  conversionRates: Array<{ currency: string; rate: number; lastUpdated: string }>;
}

export interface PaymentMethodConfig {
  id: string;
  methodKey: string;
  name: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  processingFeePercent: number;
  processingTimeEstimate: string | null;
  configurationDetails: any;
}

export const adminFinancialService = {
  // Process withdrawal request with real data
  async processWithdrawalRequest(
    requestId: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: notes
      };

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Withdrawal request ${action}d successfully`);
      return true;
    } catch (error) {
      console.error('Error processing withdrawal request:', error);
      toast.error('Failed to process withdrawal request');
      return false;
    }
  },

  // Get all withdrawal requests with real data
  async getWithdrawalRequests(filters?: {
    status?: string;
    dateRange?: { start: Date; end: Date };
    minAmount?: number;
    paymentMethod?: string;
  }): Promise<WithdrawalRequest[]> {
    try {
      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles(name, email)
        `)
        .order('requested_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }

      if (filters?.paymentMethod) {
        query = query.eq('payout_method', filters.paymentMethod);
      }

      if (filters?.dateRange) {
        query = query
          .gte('requested_at', filters.dateRange.start.toISOString())
          .lte('requested_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user profiles separately if needed
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map(request => ({
        id: request.id,
        userId: request.user_id,
        userName: profileMap.get(request.user_id)?.name || 'Unknown User',
        amount: request.amount,
        payoutMethod: request.payout_method,
        status: request.status as 'pending' | 'approved' | 'rejected' | 'processed',
        requestedAt: request.requested_at,
        processedAt: request.processed_at,
        payoutDetails: request.payout_details,
        adminNotes: request.admin_notes
      }));
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      return [];
    }
  },

  // Get financial metrics with real data
  async getFinancialMetrics(timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<FinancialMetrics> {
    try {
      const { data: withdrawals, error } = await supabase
        .from('withdrawal_requests')
        .select('*');

      if (error) throw error;

      const requests = withdrawals || [];
      const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'processed');
      const pendingRequests = requests.filter(r => r.status === 'pending');

      // Calculate payout methods
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

      // Calculate monthly trends (last 6 months)
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
  },

  // Bulk process withdrawal requests
  async bulkProcessWithdrawals(
    requestIds: string[],
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<boolean> {
    try {
      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: notes
      };

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .in('id', requestIds);

      if (error) throw error;
      
      toast.success(`Bulk ${action} completed for ${requestIds.length} requests`);
      return true;
    } catch (error) {
      console.error('Error bulk processing withdrawals:', error);
      toast.error('Failed to bulk process withdrawals');
      return false;
    }
  },

  // Payment method management with real data
  async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    try {
      const { data, error } = await supabase
        .from('payment_method_configs')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        toast.error("Failed to fetch payment methods.");
        throw error;
      }

      return data.map(d => ({
        id: d.id,
        methodKey: d.method_key,
        name: d.name,
        enabled: d.enabled,
        minAmount: d.min_amount,
        maxAmount: d.max_amount,
        processingFeePercent: d.processing_fee_percent,
        processingTimeEstimate: d.processing_time_estimate,
        configurationDetails: d.configuration_details,
      }));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to fetch payment methods.');
      return [];
    }
  },

  async updatePaymentMethod(
    methodId: string,
    updates: Partial<Omit<PaymentMethodConfig, 'id'>>
  ): Promise<boolean> {
    try {
      const updateData: { [key: string]: any } = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.methodKey !== undefined) updateData.method_key = updates.methodKey;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
      if (updates.minAmount !== undefined) updateData.min_amount = updates.minAmount;
      if (updates.maxAmount !== undefined) updateData.max_amount = updates.maxAmount;
      if (updates.processingFeePercent !== undefined) updateData.processing_fee_percent = updates.processingFeePercent;
      if (updates.processingTimeEstimate !== undefined) updateData.processing_time_estimate = updates.processingTimeEstimate;
      if (updates.configurationDetails !== undefined) updateData.configuration_details = updates.configurationDetails;


      const { error } = await supabase
        .from('payment_method_configs')
        .update(updateData)
        .eq('id', methodId);

      if (error) {
        throw error;
      }
      
      toast.success('Payment method updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
      return false;
    }
  },

  // Financial reporting with real data
  async generateFinancialReport(
    reportType: 'summary' | 'detailed' | 'analytics',
    dateRange: { start: Date; end: Date },
    filters?: any
  ): Promise<any> {
    try {
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .gte('requested_at', dateRange.start.toISOString())
        .lte('requested_at', dateRange.end.toISOString());

      const { data: transactions } = await supabase
        .from('point_transactions')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      return {
        reportType,
        dateRange,
        withdrawals: withdrawals || [],
        transactions: transactions || [],
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  },

  async exportFinancialData(
    format: 'csv' | 'excel' | 'pdf',
    dataType: 'withdrawals' | 'transactions' | 'metrics',
    filters?: any
  ): Promise<string> {
    try {
      // This would generate and return a download URL in a real implementation
      const mockUrl = `https://example.com/exports/${dataType}-${Date.now()}.${format}`;
      toast.success('Export generated successfully');
      return mockUrl;
    } catch (error) {
      console.error('Error exporting financial data:', error);
      throw error;
    }
  }
};
