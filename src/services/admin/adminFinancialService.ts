
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
  payoutDetails: any;
}

export interface FinancialMetrics {
  totalPayouts: number;
  pendingPayouts: number;
  totalRevenue: number;
  avgWithdrawalAmount: number;
  payoutMethods: Array<{ method: string; count: number; amount: number }>;
  monthlyTrends: Array<{ month: string; payouts: number; revenue: number }>;
}

export const adminFinancialService = {
  // Process withdrawal requests
  async processWithdrawalRequest(
    requestId: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'process_withdrawal_request',
          data: { 
            requestId, 
            action, 
            notes,
            processedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success(`Withdrawal request ${action}d successfully`);
      return true;
    } catch (error) {
      console.error('Error processing withdrawal request:', error);
      toast.error('Failed to process withdrawal request');
      return false;
    }
  },

  // Get all withdrawal requests with filtering
  async getWithdrawalRequests(filters?: {
    status?: string;
    dateRange?: { start: Date; end: Date };
    minAmount?: number;
  }): Promise<WithdrawalRequest[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_withdrawal_requests',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      return [];
    }
  },

  // Get financial metrics and analytics
  async getFinancialMetrics(timeframe: 'month' | 'quarter' | 'year' = 'month'): Promise<FinancialMetrics> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_financial_metrics',
          data: { timeframe }
        }
      });

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'bulk_process_withdrawals',
          data: { requestIds, action, notes }
        }
      });

      if (error) throw error;
      
      toast.success(`Bulk ${action} completed for ${requestIds.length} requests`);
      return true;
    } catch (error) {
      console.error('Error bulk processing withdrawals:', error);
      toast.error('Failed to bulk process withdrawals');
      return false;
    }
  }
};
