
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
