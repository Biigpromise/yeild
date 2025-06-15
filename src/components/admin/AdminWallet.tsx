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

export const AdminWallet = () => {
  const handleApproveRequest = (id: string, updatePayoutRequest: (id: string, updates: Partial<any>) => void) => {
    const today = new Date().toISOString().split('T')[0];
    updatePayoutRequest(id, { status: "approved", processingDate: today });
  };

  const handleRejectRequest = (id: string, updatePayoutRequest: (id: string, updates: Partial<any>) => void) => {
    const today = new Date().toISOString().split('T')[0];
    updatePayoutRequest(id, { status: "rejected", processingDate: today });
  };

  const handleToggleAutomation = (id: string, settings: any[], setSettings: (settings: any[]) => void) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  return (
    <WalletDataProvider>
      {({
        payoutRequests,
        settings,
        totalPendingAmount,
        totalProcessedAmount,
        totalPlatformBalance,
        isLoading,
        updatePayoutRequest,
        setPayoutRequests,
        setSettings,
        chartData,
      }) => (
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
              totalPlatformBalance={totalPlatformBalance}
              lastSyncTime="Just now"
            />
            <PayoutTrendsChart
              data={chartData}
              isLoading={isLoading.chart}
            />
          </div>

          <PayoutAutomationSettings
            settings={settings}
            onToggleAutomation={id => handleToggleAutomation(id, settings, setSettings)}
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
                    onApproveRequest={id => handleApproveRequest(id, updatePayoutRequest)}
                    onRejectRequest={id => handleRejectRequest(id, updatePayoutRequest)}
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
