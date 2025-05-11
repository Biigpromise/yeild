
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Import refactored components
import { WalletSummary } from "./wallet/WalletSummary";
import { PayoutTrendsChart } from "./wallet/PayoutTrendsChart";
import { PayoutAutomationSettings, AutomationSetting } from "./wallet/PayoutAutomationSettings";
import { PendingPayoutRequests } from "./wallet/PendingPayoutRequests";
import { ManageWalletBalances } from "./wallet/ManageWalletBalances";
import { PayoutHistory } from "./wallet/PayoutHistory";
import { PayoutRequest, WalletChartData } from "./wallet/types";

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
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(mockPayoutRequests);
  const [settings, setSettings] = useState<AutomationSetting[]>(automationSettings);
  const [isLoading, setIsLoading] = useState({
    chart: true,
    requests: true,
    history: true
  });
  const { toast } = useToast();
  
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

  // Auto-process payouts based on completed tasks
  useEffect(() => {
    if (settings.find(s => s.id === "auto-approval")?.enabled) {
      const timer = setTimeout(() => {
        processAutomatedPayouts();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [payoutRequests]);

  // Sync notifications to user dashboard
  useEffect(() => {
    if (settings.find(s => s.id === "auto-sync")?.enabled) {
      const syncTimer = setTimeout(() => {
        syncUserNotifications();
      }, 3000);
      return () => clearTimeout(syncTimer);
    }
  }, [payoutRequests]);
  
  const processAutomatedPayouts = () => {
    const thresholdEnabled = settings.find(s => s.id === "threshold-limit")?.enabled;
    const threshold = 300; // $300 threshold
    
    const updatedRequests = payoutRequests.map(req => {
      if (req.status === "pending" && req.taskCompleted) {
        // Auto-approve if task is completed and either below threshold or threshold check is disabled
        if (!thresholdEnabled || req.amount <= threshold) {
          toast({
            title: "Payout Auto-Approved",
            description: `$${req.amount} payout to ${req.userName} was automatically approved`,
          });
          return { ...req, status: "processing" as const };
        }
      }
      return req;
    });
    
    setPayoutRequests(updatedRequests);
  };

  const syncUserNotifications = () => {
    const requestsNeedingSync = payoutRequests.filter(
      req => !req.notificationSent && (req.status === "approved" || req.status === "rejected")
    );
    
    if (requestsNeedingSync.length > 0) {
      const updatedRequests = payoutRequests.map(req => 
        !req.notificationSent && (req.status === "approved" || req.status === "rejected")
          ? { ...req, notificationSent: true }
          : req
      );
      
      setPayoutRequests(updatedRequests);
      
      toast({
        title: "Dashboard Synchronized",
        description: `${requestsNeedingSync.length} payout status updates synchronized to user dashboard`,
      });
    }
  };
  
  const handleApproveRequest = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setPayoutRequests(payoutRequests.map(req => 
      req.id === id 
        ? { ...req, status: "approved" as const, processingDate: today } 
        : req
    ));
    
    toast({
      title: "Payout Approved",
      description: "The payout request has been approved and is being processed",
    });
  };
  
  const handleRejectRequest = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setPayoutRequests(payoutRequests.map(req => 
      req.id === id 
        ? { ...req, status: "rejected" as const, processingDate: today } 
        : req
    ));
    
    toast({
      title: "Payout Rejected",
      description: "The payout request has been rejected",
      variant: "destructive"
    });
  };
  
  const toggleAutomation = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));

    // Special handling for sync setting
    if (id === "auto-sync") {
      const setting = settings.find(s => s.id === id);
      if (setting && !setting.enabled) {
        // If enabling sync, trigger an immediate sync
        syncUserNotifications();
      }
    }
    
    const setting = settings.find(s => s.id === id);
    if (setting) {
      toast({
        title: `${setting.name} ${!setting.enabled ? 'Enabled' : 'Disabled'}`,
        description: `${setting.description} is now ${!setting.enabled ? 'enabled' : 'disabled'}`,
      });
    }
  };

  return (
    <div className="space-y-6">
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
        onToggleAutomation={toggleAutomation} 
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
              <PendingPayoutRequests 
                requests={payoutRequests} 
                onApprove={handleApproveRequest} 
                onReject={handleRejectRequest}
                isLoading={isLoading.requests} 
              />
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
  );
};
