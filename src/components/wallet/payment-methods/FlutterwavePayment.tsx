
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { nigerianBanks } from "@/services/nigerianBanksService";
import { paymentMethodsService } from "@/services/paymentMethodsService";
import { toast } from "sonner";

interface FlutterwavePaymentProps {
  onDetailsChange: (details: any) => void;
  details: any;
  userPoints: number;
  amount: string;
}

export const FlutterwavePayment: React.FC<FlutterwavePaymentProps> = ({
  onDetailsChange,
  details,
  userPoints,
  amount
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const minWithdrawal = 1000;
  const processingFee = 5; // 5%
  const withdrawalAmount = parseInt(amount) || 0;
  const feeAmount = Math.round(withdrawalAmount * (processingFee / 100));
  const netAmount = withdrawalAmount - feeAmount;

  const handleBankSelect = (bankCode: string) => {
    const bank = nigerianBanks.find(b => b.code === bankCode);
    if (bank) {
      onDetailsChange({
        ...details,
        bankCode: bankCode,
        bankName: bank.name,
        accountName: '', // Clear account name when bank changes
        currency: 'NGN',
        country: 'NG',
        processingFee: feeAmount,
        netAmount: netAmount
      });
      setVerified(false);
      setVerificationError('');
    }
  };

  const handleAccountNumberChange = (accountNumber: string) => {
    // Only allow numbers and limit to 10 digits
    const cleanNumber = accountNumber.replace(/\D/g, '').slice(0, 10);
    onDetailsChange({
      ...details,
      accountNumber: cleanNumber,
      accountName: '', // Clear account name when account number changes
    });
    setVerified(false);
    setVerificationError('');
  };

  const verifyAccount = async () => {
    if (!details.bankCode || !details.accountNumber) {
      toast.error('Please select a bank and enter account number');
      return;
    }

    if (details.accountNumber.length !== 10) {
      toast.error('Account number must be exactly 10 digits');
      return;
    }

    setVerifying(true);
    setVerificationError('');

    try {
      const accountName = await paymentMethodsService.verifyAccountName(
        details.bankCode,
        details.accountNumber
      );

      if (accountName) {
        onDetailsChange({
          ...details,
          accountName: accountName
        });
        setVerified(true);
        toast.success('Account verified successfully!');
      } else {
        setVerified(false);
        setVerificationError('Could not verify account. Please check your details.');
      }
    } catch (error) {
      setVerified(false);
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const getVerificationStatus = () => {
    if (verifying) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verifying account...</span>
        </div>
      );
    }

    if (verified && details.accountName) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Account verified</span>
        </div>
      );
    }

    if (verificationError) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{verificationError}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Nigerian Bank Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            <Select value={details.bankCode || ''} onValueChange={handleBankSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Digital Banks (Faster)</div>
                  {nigerianBanks.filter(bank => bank.type === 'digital').map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Traditional Banks</div>
                  {nigerianBanks.filter(bank => bank.type === 'traditional').map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="accountNumber"
                  placeholder="Enter 10-digit account number"
                  value={details.accountNumber || ''}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  maxLength={10}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyAccount}
                  disabled={verifying || !details.bankCode || !details.accountNumber || details.accountNumber.length !== 10}
                  className="shrink-0"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
              {getVerificationStatus()}
            </div>
          </div>

          {details.accountName && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Account Verified</span>
              </div>
              <div className="text-sm text-green-700">
                <strong>Account Name:</strong> {details.accountName}
              </div>
              <div className="text-sm text-green-700">
                <strong>Bank:</strong> {details.bankName}
              </div>
            </div>
          )}
        </div>

        {withdrawalAmount >= minWithdrawal && details.accountName && (
          <div className="space-y-3">
            <h4 className="font-medium">Withdrawal Summary</h4>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount:</span>
                  <span>{withdrawalAmount.toLocaleString()} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee ({processingFee}%):</span>
                  <span>-{feeAmount.toLocaleString()} points</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>You'll Receive:</span>
                  <span>{netAmount.toLocaleString()} points (≈ ₦{(netAmount / 1000).toFixed(2)})</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Processing Information</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>• Withdrawals are processed within 24 hours</p>
            <p>• Digital banks (OPay, Kuda, PalmPay) are faster</p>
            <p>• Minimum withdrawal: {minWithdrawal.toLocaleString()} points</p>
            <p>• Processing fee: {processingFee}% of withdrawal amount</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
