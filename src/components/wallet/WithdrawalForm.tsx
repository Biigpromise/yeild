
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
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
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
    if (!user || !paymentMethod) return;

    // Validation based on payment method
    if (paymentMethod === 'gift_card') {
      if (!payoutDetails.giftCardId) {
        toast.error("Please select a gift card");
        return;
      }
    } else if (paymentMethod === 'yield_wallet') {
      if (withdrawalAmount < 100) {
        toast.error("Minimum transfer to yield wallet is 100 points");
        return;
      }
    } else if (withdrawalAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${minWithdrawal.toLocaleString()} points`);
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

        if (walletError) throw walletError;

        // Update wallet balance
        const { error: updateError } = await supabase
          .from('yield_wallets')
          .update({ 
            balance: (wallet.balance || 0) + withdrawalAmount,
            total_earned: (wallet.total_earned || 0) + withdrawalAmount
          })
          .eq('id', wallet.id);

        if (updateError) throw updateError;

        // Record transaction
        await supabase
          .from('yield_wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            transaction_type: 'deposit',
            amount: withdrawalAmount,
            description: 'Transfer from main balance'
          });

        // Update user points
        await supabase
          .from('profiles')
          .update({ points: userPoints - withdrawalAmount })
          .eq('id', user.id);

        toast.success("Points transferred to yield wallet successfully!");
        onWithdrawalSubmitted();
        return;
      }

      // For other payment methods, create withdrawal request
      if (paymentMethod === 'bank_transfer') {
        const nigerianBanks = [
          { name: "Access Bank", code: "044" },
          { name: "Diamond Bank", code: "063" },
          { name: "Ecobank Nigeria", code: "050" },
          { name: "Fidelity Bank", code: "070" },
          { name: "First Bank of Nigeria", code: "011" },
          { name: "First City Monument Bank", code: "214" },
          { name: "Guaranty Trust Bank", code: "058" },
          { name: "Heritage Bank", code: "030" },
          { name: "Keystone Bank", code: "082" },
          { name: "Polaris Bank", code: "076" },
          { name: "Providus Bank", code: "101" },
          { name: "Stanbic IBTC Bank", code: "221" },
          { name: "Standard Chartered Bank", code: "068" },
          { name: "Sterling Bank", code: "232" },
          { name: "Union Bank of Nigeria", code: "032" },
          { name: "United Bank For Africa", code: "033" },
          { name: "Unity Bank", code: "215" },
          { name: "Wema Bank", code: "035" },
          { name: "Zenith Bank", code: "057" }
        ];
        const selectedBank = nigerianBanks.find(bank => bank.code === payoutDetails.bankCode);
        details = { 
          accountNumber: payoutDetails.accountNumber,
          bankCode: payoutDetails.bankCode,
          bankName: selectedBank?.name,
          accountName: payoutDetails.accountName,
          notes: payoutDetails.notes
        };
      } else if (paymentMethod === 'gift_card') {
        finalAmount = payoutDetails.amount; // Use the gift card points requirement
        details = {
          giftCardId: payoutDetails.giftCardId,
          giftCardProvider: payoutDetails.giftCardProvider,
          giftCardDenomination: payoutDetails.giftCardDenomination
        };
      }

      const { error } = await supabase
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

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setPayoutDetails({});
      onWithdrawalSubmitted();
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error("Failed to submit withdrawal request");
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bank_transfer" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Bank
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-1">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="gift_card" className="flex items-center gap-1">
                <Gift className="h-4 w-4" />
                Gift Cards
              </TabsTrigger>
              <TabsTrigger value="yield_wallet" className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                Yield Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank_transfer">
              <BankTransferForm
                amount={amount}
                setAmount={setAmount}
                payoutDetails={payoutDetails}
                setPayoutDetails={setPayoutDetails}
                minWithdrawal={minWithdrawal}
                maxWithdrawal={maxWithdrawal}
              />
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              <CryptoPayment 
                onDetailsChange={setPayoutDetails} 
                details={payoutDetails}
              />
              {payoutDetails.cryptoType && (
                <div className="space-y-2">
                  <Label htmlFor="crypto-amount">Withdrawal Amount (Points)</Label>
                  <input
                    id="crypto-amount"
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

            <TabsContent value="gift_card">
              <GiftCardPayment 
                onDetailsChange={setPayoutDetails} 
                details={payoutDetails}
                userPoints={userPoints}
              />
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

          {/* Notes for all methods except gift cards */}
          {paymentMethod !== 'gift_card' && (
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
             paymentMethod === 'gift_card' ? "Redeem Gift Card" : 
             "Submit Withdrawal Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
