
import React from "react";

interface AmountBreakdownProps {
  withdrawalAmount: number;
  paymentMethod: string;
  processingFee: number;
}

const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const AmountBreakdown = ({
  withdrawalAmount,
  paymentMethod,
  processingFee
}: AmountBreakdownProps) => {
  const feeAmount = paymentMethod === 'yield_wallet' ? 0 : Math.round(withdrawalAmount * (processingFee / 100));
  const netAmount = withdrawalAmount - feeAmount;

  if (withdrawalAmount <= 0 || paymentMethod === 'gift_card') {
    return null;
  }

  return (
    <div className="p-3 bg-muted rounded-lg space-y-1">
      <div className="flex justify-between text-sm">
        <span>{paymentMethod === 'yield_wallet' ? 'Transfer Amount:' : 'Withdrawal Amount:'}</span>
        <span>{withdrawalAmount.toLocaleString()} points</span>
      </div>
      {paymentMethod !== 'yield_wallet' && (
        <div className="flex justify-between text-sm text-orange-600">
          <span>Processing Fee ({processingFee}%):</span>
          <span>-{feeAmount.toLocaleString()} points</span>
        </div>
      )}
      <div className="flex justify-between font-medium border-t pt-1">
        <span>{paymentMethod === 'yield_wallet' ? 'You will receive:' : 'Net Amount:'}</span>
        <span>
          {netAmount.toLocaleString()} points
          {paymentMethod === 'bank_transfer' && ` ≈ ${formatNaira(netAmount / 10)}`}
        </span>
      </div>
    </div>
  );
};
