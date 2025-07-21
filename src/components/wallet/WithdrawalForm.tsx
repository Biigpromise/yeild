
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
      toast.error("Please log in and select a payment method");
      return;
    }

    // Enhanced validation
    if (paymentMethod === 'yield_wallet') {
      if (withdrawalAmount < 100) {
        toast.error("Minimum transfer to yield wallet is 100 points");
        return;
      }
    } else if (withdrawalAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${minWithdrawal.toLocaleString()} points`);
      return;
    }

    if (withdrawalAmount > userPoints) {
      toast.error("Insufficient points for this withdrawal");
      return;
    }

    setLoading(true);
    try {
      let details = payoutDetails;
      let finalAmount = withdrawalAmount;

      console.log('Processing withdrawal:', { paymentMethod, withdrawalAmount, userPoints });

      // Handle yield wallet transfers differently
      if (paymentMethod === 'yield_wallet') {
        // Check if user has a yield wallet
        const { data: existingWallet, error: walletCheckError } = await supabase
          .from('yield_wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (walletCheckError) {
          console.error('Error checking wallet:', walletCheckError);
          throw walletCheckError;
        }

        // Create or update yield wallet
        if (existingWallet) {
          // Update existing wallet
          const { error: updateError } = await supabase
            .from('yield_wallets')
            .update({ 
              balance: (existingWallet.balance || 0) + withdrawalAmount,
              total_earned: (existingWallet.total_earned || 0) + withdrawalAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingWallet.id);

          if (updateError) {
            console.error('Error updating wallet:', updateError);
            throw updateError;
          }

          // Record transaction
          const { error: transactionError } = await supabase
            .from('yield_wallet_transactions')
            .insert({
              wallet_id: existingWallet.id,
              transaction_type: 'deposit',
              amount: withdrawalAmount,
              description: 'Transfer from main balance'
            });

          if (transactionError) {
            console.error('Error recording transaction:', transactionError);
            // Don't throw here as the main transfer succeeded
          }
        } else {
          // Create new wallet
          const { data: newWallet, error: createError } = await supabase
            .from('yield_wallets')
            .insert({
              user_id: user.id,
              balance: withdrawalAmount,
              total_earned: withdrawalAmount,
              total_spent: 0
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating wallet:', createError);
            throw createError;
          }

          // Record transaction for new wallet
          const { error: transactionError } = await supabase
            .from('yield_wallet_transactions')
            .insert({
              wallet_id: newWallet.id,
              transaction_type: 'deposit',
              amount: withdrawalAmount,
              description: 'Transfer from main balance'
            });

          if (transactionError) {
            console.error('Error recording transaction:', transactionError);
            // Don't throw here as the main transfer succeeded
          }
        }

        // Update user points
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            points: userPoints - withdrawalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (pointsError) {
          console.error('Error updating user points:', pointsError);
          throw pointsError;
        }

        toast.success("Points transferred to yield wallet successfully!");
        setAmount("");
        setPayoutDetails({});
        onWithdrawalSubmitted();
        return;
      }

      // For other payment methods, create withdrawal request
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
          processingFee: payoutDetails.processingFee,
          netAmount: payoutDetails.netAmount
        };
      }

      console.log('Creating withdrawal request:', { details, finalAmount });

      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: finalAmount,
          payout_method: paymentMethod,
          payout_details: details,
          recipient_address: payoutDetails.walletAddress,
          exchange_rate: paymentMethod === 'crypto' ? 1 : null,
          gift_card_type: paymentMethod === 'gift_card' ? payoutDetails.giftCardProvider : null,
          status: 'pending'
        });

      if (withdrawalError) {
        console.error('Error creating withdrawal request:', withdrawalError);
        throw withdrawalError;
      }

      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setPayoutDetails({});
      onWithdrawalSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      toast.error(`Failed to submit withdrawal request: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Supported Nigerian Banks</h4>
                <div className="grid grid-cols-2 gap-1 text-sm text-blue-700">
                  <span>• Access Bank</span>
                  <span>• GTB</span>
                  <span>• First Bank</span>
                  <span>• UBA</span>
                  <span>• Zenith Bank</span>
                  <span>• Fidelity Bank</span>
                  <span>• Sterling Bank</span>
                  <span>• Wema Bank</span>
                  <span>• FCMB</span>
                  <span>• Union Bank</span>
                </div>
              </div>
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
            processingFee={processingFee}
          />

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
  );
};
