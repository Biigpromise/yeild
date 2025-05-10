
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <p className="text-sm text-muted-foreground">Total Platform Balance</p>
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
