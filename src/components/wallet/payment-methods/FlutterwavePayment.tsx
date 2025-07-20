
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Smartphone, Wallet, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { paymentMethodsService, UserPaymentMethod } from "@/services/paymentMethodsService";
import { nigerianBanks, getBankByCode } from "@/services/nigerianBanksService";
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
  const { user } = useAuth();
  const [savedMethods, setSavedMethods] = useState<UserPaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('new');
  const [loading, setLoading] = useState(true);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: details.accountNumber || '',
    bankCode: details.bankCode || '',
    bankName: details.bankName || '',
    accountName: details.accountName || '',
    phoneNumber: details.phoneNumber || '',
    currency: 'NGN',
    country: 'NG'
  });

  useEffect(() => {
    if (user) {
      loadSavedMethods();
    }
  }, [user]);

  useEffect(() => {
    if (selectedMethodId !== 'new') {
      const selectedMethod = savedMethods.find(method => method.id === selectedMethodId);
      if (selectedMethod) {
        const updatedData = {
          accountNumber: selectedMethod.account_number,
          bankCode: selectedMethod.bank_code,
          bankName: selectedMethod.bank_name,
          accountName: selectedMethod.account_name,
          phoneNumber: formData.phoneNumber,
          currency: 'NGN',
          country: 'NG'
        };
        setFormData(updatedData);
        updateDetails(updatedData);
      }
    }
  }, [selectedMethodId, savedMethods]);

  const loadSavedMethods = async () => {
    if (!user) return;
    
    setLoading(true);
    const methods = await paymentMethodsService.getUserPaymentMethods(user.id);
    setSavedMethods(methods);
    
    // Auto-select default method if available
    const defaultMethod = methods.find(method => method.is_default);
    if (defaultMethod && selectedMethodId === 'new') {
      setSelectedMethodId(defaultMethod.id);
    }
    
    setLoading(false);
  };

  const updateDetails = (data: typeof formData) => {
    const withdrawalAmount = parseInt(amount) || 0;
    const processingFee = Math.round(withdrawalAmount * 0.05); // 5%
    const netAmount = withdrawalAmount - processingFee;

    onDetailsChange({
      ...data,
      processingFee,
      netAmount,
      amount: withdrawalAmount
    });
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    updateDetails(updatedData);
  };

  const handleBankSelect = (bankCode: string) => {
    const bank = getBankByCode(bankCode);
    if (bank) {
      const updatedData = {
        ...formData,
        bankCode,
        bankName: bank.name,
        accountName: '' // Reset account name for verification
      };
      setFormData(updatedData);
      updateDetails(updatedData);
    }
  };

  const verifyAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber) {
      toast.error('Please select a bank and enter account number');
      return;
    }

    setVerifyingAccount(true);
    try {
      const accountName = await paymentMethodsService.verifyAccountName(
        formData.bankCode,
        formData.accountNumber
      );

      if (accountName) {
        const updatedData = { ...formData, accountName };
        setFormData(updatedData);
        updateDetails(updatedData);
        toast.success('Account verified successfully');
      } else {
        toast.error('Could not verify account. Please check details.');
      }
    } catch (error) {
      toast.error('Account verification failed');
    } finally {
      setVerifyingAccount(false);
    }
  };

  const saveNewMethod = async () => {
    if (!user || !formData.accountName || !formData.bankCode || !formData.accountNumber) {
      toast.error('Please complete account verification first');
      return;
    }

    const newMethod = await paymentMethodsService.addPaymentMethod(user.id, {
      bank_code: formData.bankCode,
      bank_name: formData.bankName,
      account_number: formData.accountNumber,
      account_name: formData.accountName,
      method_type: 'bank_transfer'
    });

    if (newMethod) {
      await loadSavedMethods();
      setSelectedMethodId(newMethod.id);
      toast.success('Payment method saved for future use');
    }
  };

  const getMethodIcon = (methodType: string, bankName: string) => {
    if (bankName.toLowerCase().includes('opay') || bankName.toLowerCase().includes('palmpay')) {
      return <Smartphone className="h-4 w-4 text-green-500" />;
    }
    if (methodType === 'digital_wallet') {
      return <Wallet className="h-4 w-4 text-blue-500" />;
    }
    return <Building2 className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return <div className="text-center py-4">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      {savedMethods.length > 0 && (
        <div className="space-y-3">
          <Label>Choose Payment Method</Label>
          <div className="space-y-2">
            {savedMethods.map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer transition-colors ${
                  selectedMethodId === method.id 
                    ? 'border-yeild-yellow bg-yeild-yellow/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedMethodId(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMethodIcon(method.method_type, method.bank_name)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.bank_name}</span>
                          {method.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {method.account_number} • {method.account_name}
                        </div>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      {selectedMethodId === method.id && (
                        <div className="w-2 h-2 rounded-full bg-yeild-yellow"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Method Option */}
            <Card
              className={`cursor-pointer transition-colors ${
                selectedMethodId === 'new' 
                  ? 'border-yeild-yellow bg-yeild-yellow/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedMethodId('new')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Add New Payment Method</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {selectedMethodId === 'new' && (
                      <div className="w-2 h-2 rounded-full bg-yeild-yellow"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* New Method Form */}
      {selectedMethodId === 'new' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            <Select value={formData.bankCode} onValueChange={handleBankSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Digital Banks (Faster)</div>
                  {nigerianBanks.filter(bank => bank.type === 'digital').map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-500" />
                        {bank.name}
                      </div>
                    </SelectItem>
                  ))}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Traditional Banks</div>
                  {nigerianBanks.filter(bank => bank.type === 'traditional').map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {bank.name}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <div className="flex gap-2">
              <Input
                id="accountNumber"
                placeholder="Enter 10-digit account number"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                maxLength={10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={verifyAccount}
                disabled={verifyingAccount || !formData.bankCode || formData.accountNumber.length !== 10}
              >
                {verifyingAccount ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>

          {formData.accountName && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">Account Name</div>
                <div className="text-green-700">{formData.accountName}</div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={saveNewMethod}
                className="w-full"
              >
                Save for Future Use
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              placeholder="e.g., +234XXXXXXXXXX"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
