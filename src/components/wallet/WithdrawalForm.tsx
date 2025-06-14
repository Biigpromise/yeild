
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CreditCard, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutDetails, setPayoutDetails] = useState({
    accountNumber: "",
    bankCode: "",
    accountName: "",
    notes: ""
  });

  const minWithdrawal = 1000;
  const processingFee = 5; // 5%
  const maxWithdrawal = Math.min(userPoints, 10000);
  
  const withdrawalAmount = parseInt(amount) || 0;
  const feeAmount = Math.round(withdrawalAmount * (processingFee / 100));
  const netAmount = withdrawalAmount - feeAmount;
  const nairaValue = (netAmount / 10).toFixed(0); // 10 points = ₦1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !payoutMethod || withdrawalAmount < minWithdrawal) return;

    setLoading(true);
    try {
      let details = {};
      
      if (payoutMethod === 'bank_transfer') {
        const selectedBank = nigerianBanks.find(bank => bank.code === payoutDetails.bankCode);
        details = { 
          accountNumber: payoutDetails.accountNumber,
          bankCode: payoutDetails.bankCode,
          bankName: selectedBank?.name,
          accountName: payoutDetails.accountName,
          notes: payoutDetails.notes
        };
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
        accountNumber: "", bankCode: "", accountName: "", notes: ""
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
    if (payoutMethod === 'bank_transfer') {
      return payoutDetails.accountNumber && payoutDetails.bankCode && payoutDetails.accountName;
    }
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Request Withdrawal (Nigerian Naira)
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
                <span>{netAmount.toLocaleString()} points ≈ {formatNaira(parseInt(nairaValue))}</span>
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
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Nigerian Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bank Details */}
          {payoutMethod === 'bank_transfer' && (
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
                  value={payoutDetails.accountNumber}
                  onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Account holder name as per bank records"
                  value={payoutDetails.accountName}
                  onChange={(e) => setPayoutDetails({...payoutDetails, accountName: e.target.value})}
                />
              </div>
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

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Withdrawals are processed to Nigerian bank accounts only. 
              Exchange rate: 10 points = ₦1. Processing typically takes 1-3 business days.
            </p>
          </div>

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
