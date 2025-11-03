import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WithdrawalConfirmationProps {
  selectedMethod: string;
  amount: string;
  payoutDetails: any;
  userBalance: number;
  onSubmit: () => void;
}

export const WithdrawalConfirmation: React.FC<WithdrawalConfirmationProps> = ({
  selectedMethod,
  amount,
  payoutDetails,
  userBalance,
  onSubmit
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const withdrawalAmount = parseFloat(amount) || 0;
  
  // Dynamic fee calculation
  const getFeePercentage = () => {
    if (selectedMethod === 'yield_wallet') return 0;
    if (selectedMethod === 'paystack') return 0.02; // 2%
    return 0.05; // 5% for flutterwave and others
  };
  
  const processingFee = Math.ceil(withdrawalAmount * getFeePercentage());
  const netAmount = withdrawalAmount - processingFee;

  const getMethodDetails = () => {
    switch (selectedMethod) {
      case 'yield_wallet':
        return {
          name: 'Yield Wallet Transfer',
          description: 'Transfer to your yield wallet for compound earnings',
          processingTime: 'Instant',
          icon: '💰'
        };
      case 'paystack':
        return {
          name: 'Paystack Bank Transfer',
          description: 'Fast and secure transfer to your Nigerian bank account',
          processingTime: '2-10 minutes',
          icon: '🏦'
        };
      case 'flutterwave':
        return {
          name: 'Flutterwave Bank Transfer',
          description: 'Direct transfer to your Nigerian bank account',
          processingTime: '1-24 hours',
          icon: '🏦'
        };
      default:
        return {
          name: 'Unknown Method',
          description: 'Unknown withdrawal method',
          processingTime: 'Unknown',
          icon: '❓'
        };
    }
  };

  const handleConfirmWithdrawal = async () => {
    if (!user || !confirmed) {
      toast.error('Please confirm your withdrawal details');
      return;
    }

    setLoading(true);
    try {
      if (selectedMethod === 'yield_wallet') {
        // Handle yield wallet transfer
        const { data: wallet, error: walletError } = await supabase
          .from('yield_wallets')
          .upsert({
            user_id: user.id,
            balance: 0,
            total_earned: 0,
            total_spent: 0
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (walletError) throw new Error('Failed to create yield wallet');

        const { error: updateError } = await supabase
          .from('yield_wallets')
          .update({ 
            balance: (wallet.balance || 0) + withdrawalAmount,
            total_earned: (wallet.total_earned || 0) + withdrawalAmount
          })
          .eq('id', wallet.id);

        if (updateError) throw new Error('Failed to update wallet balance');

        const { error: transactionError } = await supabase
          .from('yield_wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            transaction_type: 'deposit',
            amount: withdrawalAmount,
            description: 'Transfer from main balance'
          });

        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: userBalance - withdrawalAmount })
          .eq('id', user.id);

        if (pointsError) throw new Error('Failed to update user points');

        toast.success('Points transferred to yield wallet successfully!');
      } else {
        // Handle other withdrawal methods (Paystack, Flutterwave, etc.)
        // Step 1: Deduct points from user's balance immediately
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: userBalance - withdrawalAmount })
          .eq('id', user.id);

        if (pointsError) throw new Error('Failed to deduct points from balance');

        // Step 2: Create withdrawal request
        const { error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .insert({
            user_id: user.id,
            amount: withdrawalAmount,
            payout_method: selectedMethod,
            payout_details: payoutDetails,
            status: 'pending'
          });

        if (withdrawalError) {
          // If withdrawal request creation fails, refund the points
          await supabase
            .from('profiles')
            .update({ points: userBalance })
            .eq('id', user.id);
          throw new Error('Failed to create withdrawal request');
        }

        // Step 3: Create a point transaction record
        await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            points: -withdrawalAmount,
            transaction_type: 'withdrawal',
            description: `Withdrawal request via ${selectedMethod}`
          });
        
        toast.success('Withdrawal request submitted successfully! Your balance has been updated.');
      }

      onSubmit();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const methodDetails = getMethodDetails();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Confirm Your Withdrawal</h3>
        <p className="text-muted-foreground">Please review the details before submitting</p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{methodDetails.icon}</span>
            <div>
              <div className="text-lg">{methodDetails.name}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {methodDetails.description}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Withdrawal Amount</div>
              <div className="text-2xl font-bold">₦{withdrawalAmount.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">You'll Receive</div>
              <div className="text-2xl font-bold text-primary">₦{netAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Processing Time</span>
            </div>
            <Badge variant="secondary">{methodDetails.processingTime}</Badge>
          </div>

          {processingFee > 0 && (
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm">Processing Fee</span>
              </div>
              <span className="font-semibold text-destructive">₦{processingFee.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-muted/20 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Security Notice</h5>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• All transactions are secured with bank-level encryption</p>
                <p>• Withdrawal requests are processed during business hours</p>
                <p>• You'll receive email notifications for status updates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Checkbox */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="confirm" className="text-sm cursor-pointer">
              I confirm that all details are correct and I understand that this withdrawal cannot be cancelled once processed.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleConfirmWithdrawal}
        disabled={loading || !confirmed}
        className="w-full h-12 text-lg font-semibold"
        size="lg"
      >
        {loading ? (
          'Processing...'
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {selectedMethod === 'yield_wallet' ? 'Transfer to Yield Wallet' : 'Submit Withdrawal Request'}
          </div>
        )}
      </Button>
    </div>
  );
};