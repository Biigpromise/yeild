
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
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 5000 },
  { name: 'Apr', amount: 8000 },
  { name: 'May', amount: 7000 },
  { name: 'Jun', amount: 9000 },
  { name: 'Jul', amount: 11000 },
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
  }
];

export const AdminWallet = () => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(mockPayoutRequests);
  const [settings, setSettings] = useState<AutomationSetting[]>(automationSettings);
  const { toast } = useToast();
  
  const pendingRequests = payoutRequests.filter(r => r.status === "pending" || r.status === "processing");
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
  const totalProcessedAmount = payoutRequests
    .filter(r => r.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0);
  
  // Auto-process payouts based on completed tasks
  useEffect(() => {
    if (settings.find(s => s.id === "auto-approval")?.enabled) {
      const timer = setTimeout(() => {
        processAutomatedPayouts();
      }, 2000);
      return () => clearTimeout(timer);
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
  
  const handleApproveRequest = (id: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === id ? { ...req, status: "approved" as const } : req
    ));
    
    toast({
      title: "Payout Approved",
      description: "The payout request has been approved and is being processed",
    });
  };
  
  const handleRejectRequest = (id: string) => {
    setPayoutRequests(payoutRequests.map(req => 
      req.id === id ? { ...req, status: "rejected" as const } : req
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
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WalletSummary 
          totalPendingAmount={totalPendingAmount} 
          totalProcessedAmount={totalProcessedAmount} 
        />
        <PayoutTrendsChart data={chartData} />
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
              />
            </TabsContent>
            
            <TabsContent value="manage">
              <ManageWalletBalances />
            </TabsContent>
            
            <TabsContent value="history">
              <PayoutHistory requests={payoutRequests} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
