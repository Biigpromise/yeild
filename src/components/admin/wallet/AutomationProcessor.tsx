
import { useEffect } from "react";
import { PayoutRequest } from "./types";
import { useToast } from "@/components/ui/use-toast";

type AutomationProcessorProps = {
  payoutRequests: PayoutRequest[];
  settings: {
    id: string;
    enabled: boolean;
  }[];
  onPayoutRequestsUpdate: (updatedRequests: PayoutRequest[]) => void;
};

export const AutomationProcessor: React.FC<AutomationProcessorProps> = ({
  payoutRequests,
  settings,
  onPayoutRequestsUpdate,
}) => {
  const { toast } = useToast();
  
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
    
    onPayoutRequestsUpdate(updatedRequests);
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
      
      onPayoutRequestsUpdate(updatedRequests);
      
      toast({
        title: "Dashboard Synchronized",
        description: `${requestsNeedingSync.length} payout status updates synchronized to user dashboard`,
      });
    }
  };

  return null; // This component doesn't render anything, it just handles logic
};
