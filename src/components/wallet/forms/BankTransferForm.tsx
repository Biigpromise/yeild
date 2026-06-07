
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NIGERIAN_BANKS, getPaystackSupportedBanks } from "@/services/bankService";

interface BankTransferFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  payoutDetails: any;
  setPayoutDetails: (details: any) => void;
  minWithdrawal: number;
  maxWithdrawal: number;
}

export const BankTransferForm = ({
  amount,
  setAmount,
  payoutDetails,
  setPayoutDetails,
  minWithdrawal,
  maxWithdrawal
}: BankTransferFormProps) => {
  // Only show banks supported by Paystack for withdrawals
  const supportedBanks = getPaystackSupportedBanks();

  return (
    <div className="space-y-4">
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

      <div className="space-y-3">
        <div>
          <Label htmlFor="bank">Bank (Paystack Supported)</Label>
          <Select value={payoutDetails.bankCode} onValueChange={(value) => {
            const bank = NIGERIAN_BANKS.find(b => b.code === value);
            setPayoutDetails({
              ...payoutDetails, 
              bankCode: value,
              bankName: bank?.name || ''
            });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="font-medium text-sm mb-2 text-green-600">✓ Supported for Instant Withdrawals</div>
                {supportedBanks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </div>
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
    </div>
  );
};
