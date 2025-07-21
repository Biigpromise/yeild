
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BankAccountSelector } from "../BankAccountSelector";

interface FlutterwavePaymentProps {
  onDetailsChange: (details: any) => void;
  details: any;
  userPoints: number;
  amount: string;
}

interface FlutterwaveConfig {
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  processingFeePercent: number;
  supportedCurrencies: string[];
  supportedCountries: string[];
}

const SUPPORTED_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' }
];

const SUPPORTED_COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'US', name: 'United States' }
];

export const FlutterwavePayment = ({ 
  onDetailsChange, 
  details, 
  userPoints, 
  amount 
}: FlutterwavePaymentProps) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<FlutterwaveConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    currency: details.currency || 'NGN',
    country: details.country || 'NG',
    accountNumber: details.accountNumber || '',
    bankCode: details.bankCode || '',
    accountName: details.accountName || '',
    phoneNumber: details.phoneNumber || '',
    ...details
  });

  useEffect(() => {
    loadFlutterwaveConfig();
  }, []);

  useEffect(() => {
    const withdrawalAmount = parseInt(amount) || 0;
    if (withdrawalAmount > 0 && config) {
      const processingFee = (withdrawalAmount * config.processingFeePercent) / 100;
      const netAmount = withdrawalAmount - processingFee;
      
      onDetailsChange({
        ...formData,
        amount: withdrawalAmount,
        processingFee,
        netAmount,
        currency: formData.currency,
        country: formData.country
      });
    }
  }, [amount, formData, config]);

  const loadFlutterwaveConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_method_configs')
        .select('*')
        .eq('method_key', 'flutterwave')
        .single();

      if (error) {
        console.error('Error loading Flutterwave config:', error);
        toast.error('Failed to load Flutterwave configuration');
        return;
      }

      if (data) {
        const configDetails = data.configuration_details as any;
        setConfig({
          enabled: data.enabled,
          minAmount: data.min_amount,
          maxAmount: data.max_amount,
          processingFeePercent: data.processing_fee_percent,
          supportedCurrencies: configDetails?.supportedCurrencies || ['NGN', 'USD'],
          supportedCountries: configDetails?.supportedCountries || ['NG', 'US']
        });
      }
    } catch (error) {
      console.error('Error loading Flutterwave config:', error);
      toast.error('Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
  }) => {
    const newFormData = {
      ...formData,
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      accountName: account.accountName,
      bankName: account.bankName
    };
    setFormData(newFormData);
    
    // Update parent with new details
    const withdrawalAmount = parseInt(amount) || 0;
    if (config) {
      const processingFee = (withdrawalAmount * config.processingFeePercent) / 100;
      const netAmount = withdrawalAmount - processingFee;
      
      onDetailsChange({
        ...newFormData,
        amount: withdrawalAmount,
        processingFee,
        netAmount
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update parent with new details
    const withdrawalAmount = parseInt(amount) || 0;
    if (config) {
      const processingFee = (withdrawalAmount * config.processingFeePercent) / 100;
      const netAmount = withdrawalAmount - processingFee;
      
      onDetailsChange({
        ...newFormData,
        amount: withdrawalAmount,
        processingFee,
        netAmount
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.currency &&
      formData.country &&
      formData.accountNumber &&
      formData.bankCode &&
      formData.accountName &&
      formData.phoneNumber
    );
  };

  const withdrawalAmount = parseInt(amount) || 0;
  const processingFee = config ? (withdrawalAmount * config.processingFeePercent) / 100 : 0;
  const netAmount = withdrawalAmount - processingFee;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Flutterwave configuration...</div>
        </CardContent>
      </Card>
    );
  }

  if (!config || !config.enabled) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Flutterwave payments are currently unavailable. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === formData.currency);
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(c => 
    config.supportedCurrencies.includes(c.code)
  );
  const availableCountries = SUPPORTED_COUNTRIES.filter(c => 
    config.supportedCountries.includes(c.code)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Flutterwave Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <BankAccountSelector
        onAccountSelect={handleAccountSelect}
        selectedAccount={formData.accountNumber ? {
          accountNumber: formData.accountNumber,
          bankCode: formData.bankCode,
          bankName: formData.bankName || '',
          accountName: formData.accountName
        } : undefined}
      />

      {withdrawalAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span>{withdrawalAmount} points</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee ({config.processingFeePercent}%):</span>
                <span>{processingFee.toFixed(0)} points</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>You'll receive:</span>
                <span>
                  {selectedCurrency?.symbol}{netAmount.toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Processing time: 1-3 business days. All accounts are verified before processing to ensure security.
        </AlertDescription>
      </Alert>

      {!isFormValid() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all required fields and verify your bank account to proceed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
