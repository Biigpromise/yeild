
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

type WalletSummaryProps = {
  totalPendingAmount: number;
  totalProcessedAmount: number;
};

export const WalletSummary: React.FC<WalletSummaryProps> = ({ 
  totalPendingAmount, 
  totalProcessedAmount 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Platform Balance</p>
              <span className="text-xs flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </span>
            </div>
            <h2 className="text-4xl font-bold text-yellow-500">$47,580</h2>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              <p className="text-xl font-semibold">${totalPendingAmount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-xl font-semibold">${totalProcessedAmount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
