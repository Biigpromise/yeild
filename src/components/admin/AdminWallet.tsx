
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import refactored components
import { WalletSummary } from "./wallet/WalletSummary";
import { PayoutTrendsChart } from "./wallet/PayoutTrendsChart";
import { PayoutAutomationSettings, AutomationSetting } from "./wallet/PayoutAutomationSettings";
import { PendingPayoutRequests } from "./wallet/PendingPayoutRequests";
import { ManageWalletBalances } from "./wallet/ManageWalletBalances";
import { PayoutHistory } from "./wallet/PayoutHistory";
import { PayoutRequest, WalletChartData } from "./wallet/types";

// Import new components
import { WalletDataProvider } from "./wallet/WalletDataProvider";
import { AutomationProcessor } from "./wallet/AutomationProcessor";
import { PayoutActionHandlers } from "./wallet/PayoutActionHandlers";

// Mock data
const chartData: WalletChartData[] = [
  { name: 'Jan', amount: 4000, pending: 500 },
  { name: 'Feb', amount: 3000, pending: 800 },
  { name: 'Mar', amount: 5000, pending: 600 },
  { name: 'Apr', amount: 8000, pending: 900 },
  { name: 'May', amount: 7000, pending: 1200 },
  { name: 'Jun', amount: 9000, pending: 700 },
  { name: 'Jul', amount: 11000, pending: 500 },
];

const mockPayoutRequests: PayoutRequest[] = [
  {
    id: "1",
    userId: "u123",
    userName: "John Doe",
    amount: 250,
    status: "pending",
    requestDate: "2025-05-05",
    method: "paypal",
    taskCompleted: true,
    notificationSent: true,
  },
  {
    id: "2",
    userId: "u456",
    userName: "Jane Smith",
    amount: 175,
    status: "approved",
    requestDate: "2025-05-04",
    method: "bank",
    taskCompleted: true,
    processingDate: "2025-05-06",
    notificationSent: true,
  },
  {
    id: "3",
    userId: "u789",
    userName: "Robert Johnson",
    amount: 350,
    status: "rejected",
    requestDate: "2025-05-03",
    method: "crypto",
    taskCompleted: false,
    processingDate: "2025-05-04",
    notificationSent: false,
  },
  {
    id: "4",
    userId: "u101",
    userName: "Lisa Brown",
    amount: 425,
    status: "processing",
    requestDate: "2025-05-02",
    method: "paypal",
    taskCompleted: true,
    notificationSent: false,
  },
];

const automationSettings: AutomationSetting[] = [
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
];

export const AdminWallet = () => {
  const handleApproveRequest = (id: string, updatePayoutRequest: (id: string, updates: Partial<PayoutRequest>) => void) => {
    const today = new Date().toISOString().split('T')[0];
    updatePayoutRequest(id, { status: "approved", processingDate: today });
  };
  
  const handleRejectRequest = (id: string, updatePayoutRequest: (id: string, updates: Partial<PayoutRequest>) => void) => {
    const today = new Date().toISOString().split('T')[0];
    updatePayoutRequest(id, { status: "rejected", processingDate: today });
  };
  
  const handleToggleAutomation = (id: string, settings: AutomationSetting[], setSettings: (settings: AutomationSetting[]) => void) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const initialData = {
    payoutRequests: mockPayoutRequests,
    chartData: chartData,
    automationSettings: automationSettings
  };

  return (
    <WalletDataProvider initialData={initialData}>
      {({ payoutRequests, settings, totalPendingAmount, totalProcessedAmount, isLoading, updatePayoutRequest, setPayoutRequests, setSettings }) => (
        <div className="space-y-6">
          <AutomationProcessor 
            payoutRequests={payoutRequests}
            settings={settings}
            onPayoutRequestsUpdate={setPayoutRequests}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WalletSummary 
              totalPendingAmount={totalPendingAmount} 
              totalProcessedAmount={totalProcessedAmount} 
              lastSyncTime="5 mins ago"
            />
            <PayoutTrendsChart 
              data={chartData} 
              isLoading={isLoading.chart} 
            />
          </div>
          
          <PayoutAutomationSettings 
            settings={settings} 
            onToggleAutomation={(id) => handleToggleAutomation(id, settings, setSettings)} 
          />
          
          <Card>
            <CardContent className="p-4 md:p-6">
              <Tabs defaultValue="requests">
                <TabsList className="mb-4">
                  <TabsTrigger value="requests">Payout Requests</TabsTrigger>
                  <TabsTrigger value="manage">Manage Balances</TabsTrigger>
                  <TabsTrigger value="history">Payout History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="requests">
                  <PayoutActionHandlers
                    onApproveRequest={(id) => handleApproveRequest(id, updatePayoutRequest)} 
                    onRejectRequest={(id) => handleRejectRequest(id, updatePayoutRequest)}
                  >
                    <PendingPayoutRequests 
                      requests={payoutRequests} 
                      isLoading={isLoading.requests} 
                    />
                  </PayoutActionHandlers>
                </TabsContent>
                
                <TabsContent value="manage">
                  <ManageWalletBalances />
                </TabsContent>
                
                <TabsContent value="history">
                  <PayoutHistory 
                    requests={payoutRequests}
                    isLoading={isLoading.history}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </WalletDataProvider>
  );
};
