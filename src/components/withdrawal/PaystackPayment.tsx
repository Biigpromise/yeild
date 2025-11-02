import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PaystackPaymentProps {
  payoutDetails: any;
  onDetailsChange: (details: any) => void;
}

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '999992', name: 'Opay' },
  { code: '999991', name: 'PalmPay' },
  { code: '090267', name: 'Kuda Bank' },
  { code: '090110', name: 'VFD Microfinance Bank' },
];

export const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  payoutDetails,
  onDetailsChange,
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    onDetailsChange({
      ...payoutDetails,
      [field]: value,
    });
  };

  const selectedBank = NIGERIAN_BANKS.find(b => b.code === payoutDetails.bankCode);
  const isAccountNumberValid = payoutDetails.accountNumber?.length === 10;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Lower Fees with Paystack</p>
            <p className="text-xs text-muted-foreground">
              Only 2% processing fee (vs 5% with other methods)
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="paystack-bank">Select Bank</Label>
        <Select
          value={payoutDetails.bankCode || ''}
          onValueChange={(value) => handleInputChange('bankCode', value)}
        >
          <SelectTrigger id="paystack-bank">
            <SelectValue placeholder="Choose your bank" />
          </SelectTrigger>
          <SelectContent>
            {NIGERIAN_BANKS.map((bank) => (
              <SelectItem key={bank.code} value={bank.code}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paystack-account">Account Number</Label>
        <Input
          id="paystack-account"
          type="text"
          placeholder="0123456789"
          value={payoutDetails.accountNumber || ''}
          onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
        />
        {payoutDetails.accountNumber && !isAccountNumberValid && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Account number must be 10 digits
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paystack-name">Account Name</Label>
        <Input
          id="paystack-name"
          type="text"
          placeholder="Account holder name"
          value={payoutDetails.accountName || ''}
          onChange={(e) => handleInputChange('accountName', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Ensure this matches your bank account name exactly
        </p>
      </div>

      {selectedBank && isAccountNumberValid && payoutDetails.accountName && (
        <Card className="p-3 bg-success/5 border-success/20">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-success">Ready to process withdrawal</span>
          </div>
        </Card>
      )}
    </div>
  );
};
