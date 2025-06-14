
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
  method: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  processingFee: number;
  processingTime: string;
  configuration: any;
}

export const adminFinancialService = {
  // Withdrawal request processing
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
    paymentMethod?: string;
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
  async getFinancialMetrics(timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<FinancialMetrics> {
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
  },

  // Payment method management
  async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_payment_methods'
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  async updatePaymentMethod(
    methodId: string,
    updates: Partial<PaymentMethodConfig>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_payment_method',
          data: { methodId, updates }
        }
      });

      if (error) throw error;
      toast.success('Payment method updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Failed to update payment method');
      return false;
    }
  },

  // Financial reporting
  async generateFinancialReport(
    reportType: 'summary' | 'detailed' | 'analytics',
    dateRange: { start: Date; end: Date },
    filters?: any
  ): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'generate_financial_report',
          data: { reportType, dateRange, filters }
        }
      });

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'export_financial_data',
          data: { format, dataType, filters }
        }
      });

      if (error) throw error;
      return data.downloadUrl;
    } catch (error) {
      console.error('Error exporting financial data:', error);
      throw error;
    }
  }
};
