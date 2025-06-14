
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, CreditCard, Bitcoin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WithdrawalFormProps {
  userPoints: number;
  onWithdrawalSubmitted: () => void;
}

export const WithdrawalForm = ({ userPoints, onWithdrawalSubmitted }: WithdrawalFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutDetails, setPayoutDetails] = useState({
    email: "",
    accountNumber: "",
    routingNumber: "",
    walletAddress: "",
    notes: ""
  });

  const minWithdrawal = 1000;
  const processingFee = 5; // 5%
  const maxWithdrawal = Math.min(userPoints, 10000);
  
  const withdrawalAmount = parseInt(amount) || 0;
  const feeAmount = Math.round(withdrawalAmount * (processingFee / 100));
  const netAmount = withdrawalAmount - feeAmount;
  const cashValue = (netAmount / 100).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !payoutMethod || withdrawalAmount < minWithdrawal) return;

    setLoading(true);
    try {
      let details = {};
      
      switch (payoutMethod) {
        case 'paypal':
          details = { email: payoutDetails.email, notes: payoutDetails.notes };
          break;
        case 'bank_transfer':
          details = { 
            accountNumber: payoutDetails.accountNumber,
            routingNumber: payoutDetails.routingNumber,
            notes: payoutDetails.notes
          };
          break;
        case 'crypto':
          details = { 
            walletAddress: payoutDetails.walletAddress,
            notes: payoutDetails.notes
          };
          break;
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: withdrawalAmount,
          payout_method: payoutMethod,
          payout_details: details
        });

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setPayoutMethod("");
      setPayoutDetails({
        email: "", accountNumber: "", routingNumber: "", 
        walletAddress: "", notes: ""
      });
      onWithdrawalSubmitted();
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error("Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  const isValidAmount = withdrawalAmount >= minWithdrawal && withdrawalAmount <= maxWithdrawal;
  const isValidDetails = () => {
    switch (payoutMethod) {
      case 'paypal':
        return payoutDetails.email.includes('@');
      case 'bank_transfer':
        return payoutDetails.accountNumber && payoutDetails.routingNumber;
      case 'crypto':
        return payoutDetails.walletAddress.length > 20;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Request Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
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
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Available: {userPoints.toLocaleString()} points</span>
              <span>Max: {maxWithdrawal.toLocaleString()} points</span>
            </div>
          </div>

          {/* Amount Breakdown */}
          {withdrawalAmount > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span>Withdrawal Amount:</span>
                <span>{withdrawalAmount.toLocaleString()} points</span>
              </div>
              <div className="flex justify-between text-sm text-orange-600">
                <span>Processing Fee ({processingFee}%):</span>
                <span>-{feeAmount.toLocaleString()} points</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Net Amount:</span>
                <span>{netAmount.toLocaleString()} points ≈ ${cashValue}</span>
              </div>
            </div>
          )}

          {/* Payout Method */}
          <div className="space-y-2">
            <Label>Payout Method</Label>
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    PayPal
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="crypto">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="h-4 w-4" />
                    Cryptocurrency
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payout Details */}
          {payoutMethod === 'paypal' && (
            <div className="space-y-2">
              <Label htmlFor="email">PayPal Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={payoutDetails.email}
                onChange={(e) => setPayoutDetails({...payoutDetails, email: e.target.value})}
              />
            </div>
          )}

          {payoutMethod === 'bank_transfer' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="account">Account Number</Label>
                <Input
                  id="account"
                  placeholder="Account number"
                  value={payoutDetails.accountNumber}
                  onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="routing">Routing Number</Label>
                <Input
                  id="routing"
                  placeholder="Routing number"
                  value={payoutDetails.routingNumber}
                  onChange={(e) => setPayoutDetails({...payoutDetails, routingNumber: e.target.value})}
                />
              </div>
            </div>
          )}

          {payoutMethod === 'crypto' && (
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input
                id="wallet"
                placeholder="Cryptocurrency wallet address"
                value={payoutDetails.walletAddress}
                onChange={(e) => setPayoutDetails({...payoutDetails, walletAddress: e.target.value})}
              />
            </div>
          )}

          {payoutMethod && (
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={payoutDetails.notes}
                onChange={(e) => setPayoutDetails({...payoutDetails, notes: e.target.value})}
              />
            </div>
          )}

          {/* Warning */}
          {withdrawalAmount > 0 && !isValidAmount && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                {withdrawalAmount < minWithdrawal 
                  ? `Minimum withdrawal is ${minWithdrawal.toLocaleString()} points`
                  : `Maximum withdrawal is ${maxWithdrawal.toLocaleString()} points`
                }
              </span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isValidAmount || !isValidDetails()}
          >
            {loading ? "Submitting..." : "Submit Withdrawal Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
