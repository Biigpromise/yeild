
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Phone, DollarSign, MapPin } from 'lucide-react';
import { BankAccountSelector } from '@/components/wallet/BankAccountSelector';

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
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState(details.phoneNumber || '');
  const [currency, setCurrency] = useState(details.currency || 'NGN');
  const [country, setCountry] = useState(details.country || 'NG');

  const withdrawalAmount = parseInt(amount) || 0;
  const processingFee = Math.ceil(withdrawalAmount * 0.05); // 5% processing fee
  const netAmount = withdrawalAmount - processingFee;

  useEffect(() => {
    if (selectedAccount) {
      onDetailsChange({
        ...details,
        accountNumber: selectedAccount.accountNumber,
        bankCode: selectedAccount.bankCode,
        bankName: selectedAccount.bankName,
        accountName: selectedAccount.accountName,
        phoneNumber,
        currency,
        country,
        processingFee,
        netAmount
      });
    }
  }, [selectedAccount, phoneNumber, currency, country, processingFee, netAmount]);

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Flutterwave Bank Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Enter your Nigerian bank account details</p>
              <p>• We'll verify your account information</p>
              <p>• Funds will be transferred within 1-3 business days</p>
              <p>• Processing fee: 5% of withdrawal amount</p>
            </div>
          </div>

          <BankAccountSelector
            onAccountSelect={handleAccountSelect}
            selectedAccount={selectedAccount}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NG">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Nigeria
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {withdrawalAmount > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Transaction Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span className="font-medium">{withdrawalAmount.toLocaleString()} points</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Processing Fee (5%):</span>
                  <span className="font-medium">-{processingFee.toLocaleString()} points</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Net Amount:</span>
                  <span className="text-green-600">{netAmount.toLocaleString()} points</span>
                </div>
              </div>
            </div>
          )}

          {!selectedAccount && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select or add a bank account to continue.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
