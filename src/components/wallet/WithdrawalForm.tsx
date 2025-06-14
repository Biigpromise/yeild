
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CreditCard, Banknote, Bitcoin, Gift, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CryptoPayment } from "./payment-methods/CryptoPayment";
import { GiftCardPayment } from "./payment-methods/GiftCardPayment";
import { YieldWalletPayment } from "./payment-methods/YieldWalletPayment";

interface WithdrawalFormProps {
  userPoints: number;
  onWithdrawalSubmitted: () => void;
}

// Nigerian banks list for withdrawal
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

const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
  const feeAmount = paymentMethod === 'yield_wallet' ? 0 : Math.round(withdrawalAmount * (processingFee / 100));
  const netAmount = withdrawalAmount - feeAmount;

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

  const isValidRequest = () => {
    if (paymentMethod === 'gift_card') {
      return payoutDetails.giftCardId && userPoints >= (payoutDetails.amount || 0);
    }
    if (paymentMethod === 'yield_wallet') {
      return withdrawalAmount >= 100 && withdrawalAmount <= userPoints;
    }
    if (paymentMethod === 'crypto') {
      return payoutDetails.cryptoType && payoutDetails.walletAddress && withdrawalAmount >= minWithdrawal;
    }
    if (paymentMethod === 'bank_transfer') {
      return payoutDetails.accountNumber && payoutDetails.bankCode && payoutDetails.accountName && withdrawalAmount >= minWithdrawal;
    }
    return false;
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

            <TabsContent value="bank_transfer" className="space-y-4">
              {/* Amount Input for bank transfer */}
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (Points)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Min: ${minWithdrawal.toLocaleString()}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minWithdrawal}
                  max={maxWithdrawal}
                />
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bank">Bank</Label>
                  <Select value={payoutDetails.bankCode} onValueChange={(value) => setPayoutDetails({...payoutDetails, bankCode: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianBanks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter 10-digit account number"
                    value={payoutDetails.accountNumber || ''}
                    onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="Account holder name as per bank records"
                    value={payoutDetails.accountName || ''}
                    onChange={(e) => setPayoutDetails({...payoutDetails, accountName: e.target.value})}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crypto">
              <CryptoPayment 
                onDetailsChange={setPayoutDetails} 
                details={payoutDetails}
              />
              {payoutDetails.cryptoType && (
                <div className="space-y-2">
                  <Label htmlFor="crypto-amount">Withdrawal Amount (Points)</Label>
                  <Input
                    id="crypto-amount"
                    type="number"
                    placeholder={`Min: ${minWithdrawal.toLocaleString()}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={minWithdrawal}
                    max={maxWithdrawal}
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

          {/* Amount Breakdown for non-gift card methods */}
          {withdrawalAmount > 0 && paymentMethod !== 'gift_card' && (
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
          )}

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

          {/* Validation Warning */}
          {withdrawalAmount > 0 && !isValidRequest() && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Please complete all required fields
              </span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isValidRequest()}
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
