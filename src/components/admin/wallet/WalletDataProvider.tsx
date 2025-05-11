
import React, { useState, useEffect } from "react";
import { PayoutRequest, WalletChartData } from "./types";

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
  initialData: {
    payoutRequests: PayoutRequest[];
    chartData: WalletChartData[];
    automationSettings: AutomationSetting[];
  };
  children: (data: WalletContextData) => React.ReactNode;
};

export const WalletDataProvider: React.FC<WalletDataProviderProps> = ({ 
  initialData, 
  children 
}) => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(initialData.payoutRequests);
  const [chartData] = useState<WalletChartData[]>(initialData.chartData);
  const [settings, setSettings] = useState<AutomationSetting[]>(initialData.automationSettings);
  const [isLoading, setIsLoading] = useState({
    chart: true,
    requests: true,
    history: true
  });

  // Calculate derived data
  const pendingRequests = payoutRequests.filter(r => r.status === "pending" || r.status === "processing");
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
  const totalProcessedAmount = payoutRequests
    .filter(r => r.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0);
  
  // Simulate loading states
  useEffect(() => {
    const chartTimer = setTimeout(() => {
      setIsLoading(prev => ({ ...prev, chart: false }));
    }, 1000);
    
    const requestsTimer = setTimeout(() => {
      setIsLoading(prev => ({ ...prev, requests: false }));
    }, 1500);
    
    const historyTimer = setTimeout(() => {
      setIsLoading(prev => ({ ...prev, history: false }));
    }, 1800);
    
    return () => {
      clearTimeout(chartTimer);
      clearTimeout(requestsTimer);
      clearTimeout(historyTimer);
    };
  }, []);
  
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
