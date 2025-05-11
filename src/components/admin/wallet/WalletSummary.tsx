
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

type WalletSummaryProps = {
  totalPendingAmount: number;
  totalProcessedAmount: number;
  totalPlatformBalance?: number;
  lastSyncTime?: string;
};

export const WalletSummary: React.FC<WalletSummaryProps> = ({ 
  totalPendingAmount, 
  totalProcessedAmount,
  totalPlatformBalance = 47580,
  lastSyncTime = "Just now"
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Wallet Summary</CardTitle>
          <TooltipWrapper content="Last updated from payment processor">
            <span className="text-xs flex items-center text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Synced {lastSyncTime}
            </span>
          </TooltipWrapper>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <TooltipWrapper content="Total available platform funds across all accounts">
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground">Total Platform Balance</p>
                  <Info className="h-4 w-4 ml-1 text-muted-foreground/70" />
                </div>
              </TooltipWrapper>
            </div>
            <h2 className="text-4xl font-bold text-yellow-500">${totalPlatformBalance.toLocaleString()}</h2>
          </div>
          <div className="flex justify-between">
            <div>
              <TooltipWrapper content="Total amount currently awaiting payout">
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                  <Info className="h-4 w-4 ml-1 text-muted-foreground/70" />
                </div>
              </TooltipWrapper>
              <p className="text-xl font-semibold">${totalPendingAmount.toLocaleString()}</p>
            </div>
            <div>
              <TooltipWrapper content="Total amount paid out to users to date">
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <Info className="h-4 w-4 ml-1 text-muted-foreground/70" />
                </div>
              </TooltipWrapper>
              <p className="text-xl font-semibold">${totalProcessedAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
