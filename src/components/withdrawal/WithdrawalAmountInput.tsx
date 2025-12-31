import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, TrendingUp, AlertCircle, Shield, Star, Info } from 'lucide-react';

interface WithdrawalAmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  userBalance: number;
  selectedMethod: string;
  tasksCompleted?: number;
}

// Trust tier system based on completed tasks
const getTrustTier = (tasksCompleted: number) => {
  if (tasksCompleted >= 10) {
    return { level: 'trusted', name: 'Trusted User', minWithdrawal: 1000, color: 'text-green-600', bgColor: 'bg-green-500/10' };
  } else if (tasksCompleted >= 3) {
    return { level: 'active', name: 'Active User', minWithdrawal: 750, color: 'text-blue-600', bgColor: 'bg-blue-500/10' };
  }
  return { level: 'new', name: 'New User', minWithdrawal: 500, color: 'text-amber-600', bgColor: 'bg-amber-500/10' };
};

export const WithdrawalAmountInput: React.FC<WithdrawalAmountInputProps> = ({
  amount,
  onAmountChange,
  userBalance,
  selectedMethod,
  tasksCompleted = 0
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const trustTier = getTrustTier(tasksCompleted);
  const withdrawalAmount = parseFloat(amount) || 0;
  
  // Dynamic fee calculation based on method
  const getFeePercentage = () => {
    if (selectedMethod === 'yield_wallet') return 0;
    if (selectedMethod === 'paystack') return 0.02; // 2%
    return 0.05; // 5% for flutterwave and others
  };
  
  const processingFee = Math.ceil(withdrawalAmount * getFeePercentage());
  const netAmount = withdrawalAmount - processingFee;
  
  // Tiered minimum based on trust level (yield wallet always 100)
  const minWithdrawal = selectedMethod === 'yield_wallet' ? 100 : trustTier.minWithdrawal;
  const maxWithdrawal = userBalance;
  
  const quickAmounts = [
    { label: '25%', value: Math.floor(userBalance * 0.25) },
    { label: '50%', value: Math.floor(userBalance * 0.5) },
    { label: '75%', value: Math.floor(userBalance * 0.75) },
    { label: 'Max', value: userBalance }
  ].filter(item => item.value >= minWithdrawal);

  const isValidAmount = withdrawalAmount >= minWithdrawal && withdrawalAmount <= maxWithdrawal;

  // Progress to next tier
  const getNextTierProgress = () => {
    if (tasksCompleted >= 10) return { progress: 100, nextTier: null, tasksNeeded: 0 };
    if (tasksCompleted >= 3) return { progress: Math.round((tasksCompleted / 10) * 100), nextTier: 'Trusted', tasksNeeded: 10 - tasksCompleted };
    return { progress: Math.round((tasksCompleted / 3) * 100), nextTier: 'Active', tasksNeeded: 3 - tasksCompleted };
  };

  const tierProgress = getNextTierProgress();

  useEffect(() => {
    setShowBreakdown(withdrawalAmount > 0);
  }, [withdrawalAmount]);

  return (
    <div className="space-y-6">
      {/* Trust Tier Display */}
      {selectedMethod !== 'yield_wallet' && (
        <Card className={`${trustTier.bgColor} border-current/20`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className={`h-5 w-5 ${trustTier.color}`} />
                <span className={`font-semibold ${trustTier.color}`}>{trustTier.name}</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Your trust tier is based on completed tasks. Higher tiers unlock lower withdrawal minimums and more benefits.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="secondary" className={trustTier.color}>
                Min: ₦{trustTier.minWithdrawal}
              </Badge>
            </div>
            
            {tierProgress.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to {tierProgress.nextTier} tier</span>
                  <span>{tierProgress.tasksNeeded} more task{tierProgress.tasksNeeded !== 1 ? 's' : ''} needed</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${trustTier.color.replace('text-', 'bg-')} transition-all duration-500`}
                    style={{ width: `${tierProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {tasksCompleted >= 10 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Star className="h-4 w-4" />
                <span>You've unlocked the best withdrawal terms!</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <span className="text-muted-foreground">
                Processing Fee ({selectedMethod === 'yield_wallet' ? '0%' : selectedMethod === 'paystack' ? '2%' : '5%'})
              </span>
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
              {selectedMethod === 'yield_wallet' 
                ? 'Yield Wallet Transfer' 
                : selectedMethod === 'paystack'
                ? 'Paystack Bank Transfer'
                : 'Bank Transfer'} Information
            </h5>
            <div className="text-xs text-muted-foreground space-y-1">
              {selectedMethod === 'yield_wallet' ? (
                <>
                  <p>• Instant transfer with no fees</p>
                  <p>• Earn compound interest on transferred amount</p>
                  <p>• Minimum transfer: ₦100</p>
                </>
              ) : selectedMethod === 'paystack' ? (
                <>
                  <p>• Processing fee: 2% of withdrawal amount</p>
                  <p>• Processing time: 2-10 minutes</p>
                  <p>• Minimum withdrawal: ₦1,000</p>
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