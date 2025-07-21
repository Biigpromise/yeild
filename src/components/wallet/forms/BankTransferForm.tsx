
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NIGERIAN_BANKS, getBanksByType } from "@/services/bankService";

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
  const traditionalBanks = getBanksByType('traditional');
  const microfinanceBanks = getBanksByType('microfinance');
  const fintechBanks = getBanksByType('fintech');

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
                <div className="font-medium text-sm mb-2">Traditional Banks</div>
                {traditionalBanks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </div>
              
              <div className="p-2">
                <div className="font-medium text-sm mb-2">Microfinance Banks</div>
                {microfinanceBanks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </div>

              <div className="p-2">
                <div className="font-medium text-sm mb-2">Fintech Banks</div>
                {fintechBanks.map((bank) => (
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
