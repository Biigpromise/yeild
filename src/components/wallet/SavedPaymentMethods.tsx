
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  StarOff, 
  Building2,
  Smartphone,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentMethodsService, UserPaymentMethod, AddPaymentMethodData } from '@/services/paymentMethodsService';
import { nigerianBanks, getBankByCode } from '@/services/nigerianBanksService';
import { toast } from 'sonner';

interface SavedPaymentMethodsProps {
  onSelectMethod?: (method: UserPaymentMethod) => void;
  showSelectMode?: boolean;
}

export const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
  onSelectMethod,
  showSelectMode = false
}) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [formData, setFormData] = useState<AddPaymentMethodData>({
    bank_code: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    method_type: 'bank_transfer'
  });

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;
    
    setLoading(true);
    const methods = await paymentMethodsService.getUserPaymentMethods(user.id);
    setPaymentMethods(methods);
    setLoading(false);
  };

  const handleBankSelect = (bankCode: string) => {
    const bank = getBankByCode(bankCode);
    if (bank) {
      setFormData(prev => ({
        ...prev,
        bank_code: bankCode,
        bank_name: bank.name,
        method_type: bank.type === 'digital' ? 'digital_wallet' : 'bank_transfer'
      }));
    }
  };

  const verifyAccount = async () => {
    if (!formData.bank_code || !formData.account_number) {
      toast.error('Please select a bank and enter account number');
      return;
    }

    setVerifyingAccount(true);
    try {
      const accountName = await paymentMethodsService.verifyAccountName(
        formData.bank_code,
        formData.account_number
      );

      if (accountName) {
        setFormData(prev => ({ ...prev, account_name: accountName }));
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

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.account_name) {
      toast.error('Please verify the account first');
      return;
    }

    setAddingMethod(true);
    const newMethod = await paymentMethodsService.addPaymentMethod(user.id, formData);
    
    if (newMethod) {
      await loadPaymentMethods();
      setShowAddDialog(false);
      setFormData({
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        method_type: 'bank_transfer'
      });
    }
    setAddingMethod(false);
  };

  const handleSetDefault = async (methodId: string) => {
    if (!user) return;
    
    const success = await paymentMethodsService.setDefaultPaymentMethod(user.id, methodId);
    if (success) {
      await loadPaymentMethods();
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    const success = await paymentMethodsService.deletePaymentMethod(methodId);
    if (success) {
      await loadPaymentMethods();
    }
  };

  const getMethodIcon = (methodType: string, bankName: string) => {
    if (bankName.toLowerCase().includes('opay') || bankName.toLowerCase().includes('palmpay')) {
      return <Smartphone className="h-5 w-5 text-green-500" />;
    }
    if (methodType === 'digital_wallet') {
      return <Wallet className="h-5 w-5 text-blue-500" />;
    }
    return <Building2 className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved Payment Methods
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMethod} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Select Bank</Label>
                  <Select value={formData.bank_code} onValueChange={handleBankSelect}>
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
                  <div className="flex gap-2">
                    <Input
                      id="accountNumber"
                      placeholder="Enter 10-digit account number"
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                      maxLength={10}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={verifyAccount}
                      disabled={verifyingAccount || !formData.bank_code || formData.account_number.length !== 10}
                    >
                      {verifyingAccount ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </div>

                {formData.account_name && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Account Name</div>
                    <div className="text-green-700">{formData.account_name}</div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={addingMethod || !formData.account_name}>
                  {addingMethod ? 'Adding...' : 'Add Payment Method'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading payment methods...</div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved payment methods</p>
            <p className="text-sm">Add a payment method to enable quick withdrawals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  showSelectMode ? 'cursor-pointer hover:bg-muted/50' : ''
                } ${method.is_default ? 'border-yeild-yellow bg-yeild-yellow/5' : ''}`}
                onClick={() => showSelectMode && onSelectMethod?.(method)}
              >
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

                {!showSelectMode && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={method.is_default}
                    >
                      {method.is_default ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
