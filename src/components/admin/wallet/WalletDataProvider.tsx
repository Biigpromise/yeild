import React, { useState, useEffect } from "react";
import { PayoutRequest, WalletChartData } from "./types";
import { adminFinancialService } from "@/services/admin/adminFinancialService";

// Assuming AutomationSetting is still local and not in DB (unless you request otherwise)
export type AutomationSetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type WalletContextData = {
  payoutRequests: PayoutRequest[];
  chartData: WalletChartData[];
  settings: AutomationSetting[];
  totalPendingAmount: number;
  totalProcessedAmount: number;
  isLoading: {
    chart: boolean;
    requests: boolean;
    history: boolean;
  };
  setPayoutRequests: (requests: PayoutRequest[]) => void;
  setSettings: (settings: AutomationSetting[]) => void;
  updatePayoutRequest: (id: string, updates: Partial<PayoutRequest>) => void;
};

type WalletDataProviderProps = {
  initialData?: {
    payoutRequests?: PayoutRequest[];
    chartData?: WalletChartData[];
    automationSettings?: AutomationSetting[];
  };
  children: (data: WalletContextData) => React.ReactNode;
};

export const WalletDataProvider: React.FC<WalletDataProviderProps> = ({
  initialData = {},
  children,
}) => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(initialData.payoutRequests || []);
  const [chartData, setChartData] = useState<WalletChartData[]>(initialData.chartData || []);
  const [settings, setSettings] = useState<AutomationSetting[]>(initialData.automationSettings || [
    {
      id: "auto-approval",
      name: "Automatic Payout Approval",
      description: "Automatically approve payouts when tasks are verified as completed",
      enabled: true
    },
    {
      id: "threshold-limit",
      name: "Threshold Approval",
      description: "Auto-approve payouts below a certain threshold (currently $300)",
      enabled: true
    },
    {
      id: "instant-processing",
      name: "Instant Processing",
      description: "Process approved payouts immediately without admin review",
      enabled: false
    },
    {
      id: "verification-hold",
      name: "Verification Hold",
      description: "Hold payouts for 24 hours for fraud prevention checks",
      enabled: true
    },
    {
      id: "auto-sync",
      name: "Dashboard Synchronization",
      description: "Automatically sync payment statuses between admin and user dashboards",
      enabled: true
    }
  ]);
  const [isLoading, setIsLoading] = useState({
    chart: true,
    requests: true,
    history: true
  });

  // Fetch payout requests
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(prev => ({ ...prev, requests: true }));
      try {
        const requests = await adminFinancialService.getWithdrawalRequests();
        setPayoutRequests(
          requests.map(req => ({
            ...req,
            method: req.payoutMethod,
            requestDate: req.requestedAt?.split("T")[0] || req.requestedAt,
            processingDate: req.processedAt?.split("T")[0] || req.processedAt,
            taskCompleted: true, // You may want to change depending on your backend
            notificationSent: true, // Set based on your backend if you track this
            // Note: No status mapping here, `status` can now be "processed"
          }))
        );
      } catch (e) {
        setPayoutRequests([]);
      } finally {
        setIsLoading(prev => ({ ...prev, requests: false }));
      }
    };
    fetchRequests();
  }, []);

  // Fetch chart data (simulate month summary via metric service)
  useEffect(() => {
    const fetchChart = async () => {
      setIsLoading(prev => ({ ...prev, chart: true }));
      try {
        const metrics = await adminFinancialService.getFinancialMetrics('month');
        // Transform financial metrics' monthlyTrends to WalletChartData
        setChartData(
          metrics.monthlyTrends.map(mt => ({
            name: mt.month,
            amount: mt.payouts,
            pending: undefined // If available in metrics, set here
          }))
        );
      } catch (e) {
        setChartData([]);
      } finally {
        setIsLoading(prev => ({ ...prev, chart: false }));
      }
    };
    fetchChart();
  }, []);

  // Simulate history loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(prev => ({ ...prev, history: false }));
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate derived data
  const pendingRequests = payoutRequests.filter(r => r.status === "pending" || r.status === "processing");
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + (req.amount || 0), 0);
  const totalProcessedAmount = payoutRequests
    .filter(r => r.status === "approved" || r.status === "processed")
    .reduce((sum, req) => sum + (req.amount || 0), 0);

  const updatePayoutRequest = (id: string, updates: Partial<PayoutRequest>) => {
    setPayoutRequests(prev =>
      prev.map(req => req.id === id ? { ...req, ...updates } : req)
    );
  };

  const contextValue: WalletContextData = {
    payoutRequests,
    chartData,
    settings,
    totalPendingAmount,
    totalProcessedAmount,
    isLoading,
    setPayoutRequests,
    setSettings,
    updatePayoutRequest,
  };

  return <>{children(contextValue)}</>;
};
