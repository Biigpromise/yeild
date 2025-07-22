import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BankVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBankVerified: (bankDetails: any) => void;
}

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '058', name: 'Diamond Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '057', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' }
];

export const BankVerification: React.FC<BankVerificationProps> = ({
  open,
  onOpenChange,
  onBankVerified
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState({
    account_number: '',
    bank_code: '',
    bank_name: ''
  });
  const [verifiedAccount, setVerifiedAccount] = useState<any>(null);

  const handleVerifyAccount = async () => {
    if (!formData.account_number || !formData.bank_code) {
      toast.error('Please enter account number and select a bank');
      return;
    }

    setVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-bank-account', {
        body: {
          account_number: formData.account_number,
          account_bank: formData.bank_code
        }
      });

      if (error) throw error;

      if (data.success) {
        setVerifiedAccount({
          ...data,
          bank_name: formData.bank_name
        });
        toast.success('Bank account verified successfully!');
      } else {
        throw new Error(data.error || 'Account verification failed');
      }
    } catch (error: any) {
      console.error('Bank verification error:', error);
      toast.error(error.message || 'Failed to verify bank account');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!verifiedAccount || !user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('crypto_addresses')
        .insert({
          user_id: user.id,
          crypto_type: 'bank_account',
          wallet_address: verifiedAccount.account_number,
          network: verifiedAccount.bank_code,
          is_verified: true
        });

      if (error) throw error;

      onBankVerified(verifiedAccount);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving bank account:', error);
      toast.error('Failed to save bank account');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ account_number: '', bank_code: '', bank_name: '' });
    setVerifiedAccount(null);
  };

  const handleBankSelect = (bankCode: string) => {
    const bank = NIGERIAN_BANKS.find(b => b.code === bankCode);
    setFormData(prev => ({
      ...prev,
      bank_code: bankCode,
      bank_name: bank?.name || ''
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bank">Select Bank</Label>
            <Select value={formData.bank_code} onValueChange={handleBankSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
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

          <div>
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
              placeholder="Enter your account number"
              maxLength={10}
            />
          </div>

          {verifiedAccount && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Account Verified!</p>
              <p className="text-sm text-green-700">
                Account Name: {verifiedAccount.account_name}
              </p>
              <p className="text-sm text-green-700">
                Account Number: {verifiedAccount.account_number}
              </p>
              <p className="text-sm text-green-700">
                Bank: {verifiedAccount.bank_name}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!verifiedAccount ? (
              <Button
                onClick={handleVerifyAccount}
                disabled={verifying || !formData.account_number || !formData.bank_code}
                className="flex-1"
              >
                {verifying ? 'Verifying...' : 'Verify Account'}
              </Button>
            ) : (
              <Button
                onClick={handleSaveAccount}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save Account'}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};