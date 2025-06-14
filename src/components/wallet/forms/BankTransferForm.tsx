
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankTransferFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  payoutDetails: any;
  setPayoutDetails: (details: any) => void;
  minWithdrawal: number;
  maxWithdrawal: number;
}

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

export const BankTransferForm = ({
  amount,
  setAmount,
  payoutDetails,
  setPayoutDetails,
  minWithdrawal,
  maxWithdrawal
}: BankTransferFormProps) => {
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
    </div>
  );
};
