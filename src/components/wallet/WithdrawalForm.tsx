
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Banknote, Bitcoin, Gift, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CryptoPayment } from "./payment-methods/CryptoPayment";
import { GiftCardPayment } from "./payment-methods/GiftCardPayment";
import { YieldWalletPayment } from "./payment-methods/YieldWalletPayment";
import { FlutterwavePayment } from "./payment-methods/FlutterwavePayment";
import { BankTransferForm } from "./forms/BankTransferForm";
import { AmountBreakdown } from "./forms/AmountBreakdown";
import { WithdrawalValidation, useWithdrawalValidation } from "./forms/WithdrawalValidation";
import { WithdrawalLimits } from "./forms/WithdrawalLimits";

interface WithdrawalFormProps {
  userPoints: number;
  onWithdrawalSubmitted: () => void;
}

export const WithdrawalForm = ({ userPoints, onWithdrawalSubmitted }: WithdrawalFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("flutterwave");
  const [amount, setAmount] = useState("");
  const [payoutDetails, setPayoutDetails] = useState<any>({});

  const minWithdrawal = 1000;
  const processingFee = 5; // 5%
  const maxWithdrawal = Math.min(userPoints, 10000);
  
  const withdrawalAmount = parseInt(amount) || payoutDetails.amount || 0;
  
  const isValidRequest = useWithdrawalValidation(
    withdrawalAmount,
    paymentMethod,
    payoutDetails,
    userPoints,
    minWithdrawal
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !paymentMethod) {
      toast.error("Please login and select a payment method");
      return;
    }

    if (!isValidRequest) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      let details = payoutDetails;
      let finalAmount = withdrawalAmount;

      // Handle yield wallet transfers differently
      if (paymentMethod === 'yield_wallet') {
        // Create/update yield wallet
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

        if (walletError) {
          console.error('Wallet error:', walletError);
          throw new Error('Failed to create yield wallet');
        }

        // Update wallet balance
        const { error: updateError } = await supabase
          .from('yield_wallets')
          .update({ 
            balance: (wallet.balance || 0) + withdrawalAmount,
            total_earned: (wallet.total_earned || 0) + withdrawalAmount
          })
          .eq('id', wallet.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error('Failed to update wallet balance');
        }

        // Record transaction
        const { error: transactionError } = await supabase
          .from('yield_wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            transaction_type: 'deposit',
            amount: withdrawalAmount,
            description: 'Transfer from main balance'
          });

        if (transactionError) {
          console.error('Transaction error:', transactionError);
          // Don't throw here as the main transfer succeeded
        }

        // Update user points
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: userPoints - withdrawalAmount })
          .eq('id', user.id);

        if (pointsError) {
          console.error('Points error:', pointsError);
          throw new Error('Failed to update user points');
        }

        toast.success("Points transferred to yield wallet successfully!");
        onWithdrawalSubmitted();
        return;
      }

      // For other payment methods, validate required fields
      if (paymentMethod === 'flutterwave') {
        if (!payoutDetails.accountNumber || !payoutDetails.bankCode || !payoutDetails.accountName) {
          toast.error("Please fill in all required bank details");
          return;
        }
        
        details = {
          accountNumber: payoutDetails.accountNumber,
          bankCode: payoutDetails.bankCode,
          accountName: payoutDetails.accountName,
          phoneNumber: payoutDetails.phoneNumber,
          currency: payoutDetails.currency || 'NGN',
          country: payoutDetails.country || 'NG',
          processingFee: Math.ceil(withdrawalAmount * 0.05),
          netAmount: withdrawalAmount - Math.ceil(withdrawalAmount * 0.05)
        };
      }

      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: finalAmount,
          payout_method: paymentMethod,
          payout_details: details,
          recipient_address: payoutDetails.walletAddress,
          exchange_rate: paymentMethod === 'crypto' ? 1 : null,
          gift_card_type: paymentMethod === 'gift_card' ? payoutDetails.giftCardProvider : null
        });

      if (withdrawalError) {
        console.error('Withdrawal error:', withdrawalError);
        throw new Error('Failed to create withdrawal request');
      }

      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setPayoutDetails({});
      onWithdrawalSubmitted();
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Withdraw or Transfer Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="flutterwave" className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Flutterwave
                </TabsTrigger>
                <TabsTrigger value="yield_wallet" className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Yield Wallet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flutterwave">
                <FlutterwavePayment
                  onDetailsChange={setPayoutDetails}
                  details={payoutDetails}
                  userPoints={userPoints}
                  amount={amount}
                />
                {paymentMethod === 'flutterwave' && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="flutterwave-amount">Withdrawal Amount (Points)</Label>
                    <input
                      id="flutterwave-amount"
                      type="number"
                      placeholder={`Min: ${minWithdrawal.toLocaleString()}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={minWithdrawal}
                      max={maxWithdrawal}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="yield_wallet">
                <YieldWalletPayment 
                  onDetailsChange={(details) => setPayoutDetails({...details, userPoints})} 
                  details={payoutDetails}
                />
              </TabsContent>
            </Tabs>

            <AmountBreakdown
              withdrawalAmount={withdrawalAmount}
              paymentMethod={paymentMethod}
              processingFee={Math.ceil(withdrawalAmount * 0.05)}
            />

            {/* Notes for withdrawal methods */}
            {paymentMethod === 'flutterwave' && (
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={payoutDetails.notes || ''}
                  onChange={(e) => setPayoutDetails({...payoutDetails, notes: e.target.value})}
                />
              </div>
            )}

            <WithdrawalValidation
              withdrawalAmount={withdrawalAmount}
              paymentMethod={paymentMethod}
              payoutDetails={payoutDetails}
              userPoints={userPoints}
              minWithdrawal={minWithdrawal}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !isValidRequest}
            >
              {loading ? "Processing..." : 
               paymentMethod === 'yield_wallet' ? "Transfer to Yield Wallet" : 
               "Submit Withdrawal Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Withdrawal Limits */}
      <WithdrawalLimits
        userPoints={userPoints}
        userLevel={1} // You can get this from user profile
        isVerified={true} // You can get this from user profile
      />
    </div>
  );
};
