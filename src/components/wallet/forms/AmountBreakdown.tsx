
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Minus, Plus } from 'lucide-react';

interface AmountBreakdownProps {
  withdrawalAmount: number;
  paymentMethod: string;
  processingFee: number;
}

export const AmountBreakdown: React.FC<AmountBreakdownProps> = ({
  withdrawalAmount,
  paymentMethod,
  processingFee
}) => {
  if (withdrawalAmount <= 0) {
    return null;
  }

  const netAmount = withdrawalAmount - processingFee;
  const exchangeRate = 1000; // 1000 points = $1 USD
  const usdValue = (netAmount / exchangeRate).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4" />
          Transaction Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Withdrawal Amount:</span>
          <span className="font-medium">{withdrawalAmount.toLocaleString()} points</span>
        </div>
        
        {paymentMethod !== 'yield_wallet' && processingFee > 0 && (
          <div className="flex justify-between items-center text-red-600">
            <span className="text-sm flex items-center gap-1">
              <Minus className="h-3 w-3" />
              Processing Fee (5%):
            </span>
            <span className="font-medium">-{processingFee.toLocaleString()} points</span>
          </div>
        )}
        
        <div className="border-t pt-3 flex justify-between items-center font-medium">
          <span>Net Amount:</span>
          <div className="text-right">
            <div className="text-green-600">{netAmount.toLocaleString()} points</div>
            <div className="text-sm text-muted-foreground">≈ ${usdValue} USD</div>
          </div>
        </div>

        {paymentMethod === 'yield_wallet' && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-700">
              <div className="font-medium">Yield Wallet Transfer</div>
              <div>No processing fees for internal transfers</div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div>Exchange Rate: 1,000 points = $1 USD</div>
          <div>Processing time: 1-3 business days</div>
        </div>
      </CardContent>
    </Card>
  );
};
