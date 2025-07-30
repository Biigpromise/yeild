import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';

interface WithdrawalAmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  userBalance: number;
  selectedMethod: string;
}

export const WithdrawalAmountInput: React.FC<WithdrawalAmountInputProps> = ({
  amount,
  onAmountChange,
  userBalance,
  selectedMethod
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const withdrawalAmount = parseFloat(amount) || 0;
  const processingFee = selectedMethod === 'yield_wallet' ? 0 : Math.ceil(withdrawalAmount * 0.05);
  const netAmount = withdrawalAmount - processingFee;
  
  const minWithdrawal = selectedMethod === 'yield_wallet' ? 100 : 1000;
  const maxWithdrawal = userBalance;
  
  const quickAmounts = [
    { label: '25%', value: Math.floor(userBalance * 0.25) },
    { label: '50%', value: Math.floor(userBalance * 0.5) },
    { label: '75%', value: Math.floor(userBalance * 0.75) },
    { label: 'Max', value: userBalance }
  ].filter(item => item.value >= minWithdrawal);

  const isValidAmount = withdrawalAmount >= minWithdrawal && withdrawalAmount <= maxWithdrawal;

  useEffect(() => {
    setShowBreakdown(withdrawalAmount > 0);
  }, [withdrawalAmount]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Enter Withdrawal Amount</h3>
        <p className="text-muted-foreground">How much would you like to withdraw?</p>
      </div>

      {/* Amount Input */}
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5" />
            Withdrawal Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount (₦)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder={`Minimum ₦${minWithdrawal.toLocaleString()}`}
                min={minWithdrawal}
                max={maxWithdrawal}
                className="text-lg font-semibold h-12 pl-8"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ₦
              </span>
            </div>
            
            {/* Validation Messages */}
            {amount && !isValidAmount && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {withdrawalAmount < minWithdrawal 
                  ? `Minimum withdrawal is ₦${minWithdrawal.toLocaleString()}`
                  : `Maximum withdrawal is ₦${maxWithdrawal.toLocaleString()}`
                }
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Select</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount.label}
                  variant="outline"
                  size="sm"
                  onClick={() => onAmountChange(quickAmount.value.toString())}
                  className="h-8 text-xs"
                >
                  {quickAmount.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Breakdown */}
      {showBreakdown && (
        <Card className="bg-muted/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Transaction Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-muted-foreground">Withdrawal Amount</span>
              <span className="font-semibold">₦{withdrawalAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-muted-foreground">Processing Fee ({selectedMethod === 'yield_wallet' ? '0%' : '5%'})</span>
              <span className="font-semibold text-destructive">
                {processingFee > 0 ? '-' : ''}₦{processingFee.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 pt-3 border-t border-border/30">
              <span className="font-semibold">You'll Receive</span>
              <span className="font-bold text-lg text-primary">₦{netAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Remaining Balance</span>
              <span>₦{(userBalance - withdrawalAmount).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Method-specific Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h5 className="font-medium text-sm">
              {selectedMethod === 'yield_wallet' ? 'Yield Wallet Transfer' : 'Bank Transfer'} Information
            </h5>
            <div className="text-xs text-muted-foreground space-y-1">
              {selectedMethod === 'yield_wallet' ? (
                <>
                  <p>• Instant transfer with no fees</p>
                  <p>• Earn compound interest on transferred amount</p>
                  <p>• Minimum transfer: ₦100</p>
                </>
              ) : (
                <>
                  <p>• Processing fee: 5% of withdrawal amount</p>
                  <p>• Processing time: 1-24 hours</p>
                  <p>• Minimum withdrawal: ₦1,000</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};