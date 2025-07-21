import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Star, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  getUserBankAccounts, 
  saveBankAccount, 
  deleteBankAccount, 
  setDefaultBankAccount,
  verifyBankAccount,
  type SavedBankAccount 
} from '@/services/bankAccountVerification';
import { 
  getActiveBanks, 
  getBanksByType, 
  getFlutterwaveSupportedBanks,
  isBankSupportedByFlutterwave 
} from '@/services/bankService';

interface BankAccountSelectorProps {
  onAccountSelect: (account: any) => void;
  selectedAccount: any;
}

export const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({
  onAccountSelect,
  selectedAccount
}) => {
  const { user } = useAuth();
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountName: ''
  });

  const banks = getActiveBanks();
  const supportedBanks = getFlutterwaveSupportedBanks();
  const traditionalBanks = getBanksByType('traditional');
  const fintechBanks = getBanksByType('fintech');
  const microfinanceBanks = getBanksByType('microfinance');

  useEffect(() => {
    if (user) {
      loadSavedAccounts();
    }
  }, [user]);

  const loadSavedAccounts = async () => {
    if (!user) return;
    
    try {
      const accounts = await getUserBankAccounts(user.id);
      setSavedAccounts(accounts);
    } catch (error) {
      console.error('Error loading saved accounts:', error);
      toast.error('Failed to load saved accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!newAccount.accountNumber || !newAccount.bankCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyBankAccount(
        newAccount.accountNumber,
        newAccount.bankCode,
        newAccount.bankName
      );

      if (result.success && result.accountName) {
        setNewAccount(prev => ({
          ...prev,
          accountName: result.accountName
        }));
        toast.success('Account verified successfully');
      } else {
        toast.error(result.error || 'Account verification failed');
        // For unsupported banks, still allow saving with manual verification
        if (result.error?.includes('not currently supported')) {
          setNewAccount(prev => ({
            ...prev,
            accountName: 'Manual Verification Required'
          }));
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify account');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!user || !newAccount.accountName) {
      toast.error('Please verify the account first');
      return;
    }

    try {
      const isSupported = isBankSupportedByFlutterwave(newAccount.bankCode);
      const savedAccount = await saveBankAccount({
        user_id: user.id,
        account_name: newAccount.accountName,
        account_number: newAccount.accountNumber,
        bank_code: newAccount.bankCode,
        bank_name: newAccount.bankName,
        is_default: savedAccounts.length === 0,
        is_verified: isSupported && newAccount.accountName !== 'Manual Verification Required'
      });

      if (savedAccount) {
        setSavedAccounts(prev => [...prev, savedAccount]);
        setNewAccount({
          accountNumber: '',
          bankCode: '',
          bankName: '',
          accountName: ''
        });
        setShowAddForm(false);
        toast.success('Account saved successfully');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const success = await deleteBankAccount(accountId);
      if (success) {
        setSavedAccounts(prev => prev.filter(acc => acc.id !== accountId));
        if (selectedAccount?.id === accountId) {
          onAccountSelect(null);
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    if (!user) return;
    
    try {
      const success = await setDefaultBankAccount(user.id, accountId);
      if (success) {
        setSavedAccounts(prev => 
          prev.map(acc => ({
            ...acc,
            is_default: acc.id === accountId
          }))
        );
      }
    } catch (error) {
      console.error('Error setting default account:', error);
    }
  };

  const handleSelectAccount = (account: SavedBankAccount) => {
    onAccountSelect({
      id: account.id,
      accountNumber: account.account_number,
      bankCode: account.bank_code,
      bankName: account.bank_name,
      accountName: account.account_name,
      isDefault: account.is_default,
      isVerified: account.is_verified
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading saved accounts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedBank = banks.find(b => b.code === newAccount.bankCode);
  const isSelectedBankSupported = selectedBank ? isBankSupportedByFlutterwave(selectedBank.code) : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bank Account</span>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Bank Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Select 
                    value={newAccount.bankCode} 
                    onValueChange={(value) => {
                      const bank = banks.find(b => b.code === value);
                      setNewAccount(prev => ({
                        ...prev,
                        bankCode: value,
                        bankName: bank?.name || '',
                        accountName: '' // Reset account name when bank changes
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="font-medium text-sm mb-2 text-green-600">✓ Supported Banks (Auto-verification)</div>
                        {supportedBanks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {bank.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                      
                      <div className="p-2">
                        <div className="font-medium text-sm mb-2 text-orange-600">⚠ Limited Support (Manual verification)</div>
                        {traditionalBanks.filter(bank => !bank.flutterwaveSupported).map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              {bank.name}
                            </div>
                          </SelectItem>
                        ))}
                        {fintechBanks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              {bank.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>

                      <div className="p-2">
                        <div className="font-medium text-sm mb-2 text-red-600">⚠ Microfinance Banks (Manual verification)</div>
                        {microfinanceBanks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              {bank.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {selectedBank && !isSelectedBankSupported && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> {selectedBank.name} requires manual verification. 
                      Your account will be verified during the withdrawal process.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accountNumber"
                      placeholder="Enter 10-digit account number"
                      value={newAccount.accountNumber}
                      onChange={(e) => setNewAccount(prev => ({
                        ...prev,
                        accountNumber: e.target.value,
                        accountName: '' // Reset account name when number changes
                      }))}
                      maxLength={10}
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyAccount}
                      disabled={verifying || !newAccount.accountNumber || !newAccount.bankCode}
                    >
                      {verifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                </div>

                {newAccount.accountName && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Account Name:</strong> {newAccount.accountName}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAccount}
                    disabled={!newAccount.accountName}
                  >
                    Save Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {savedAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No saved accounts</p>
            <p className="text-sm">Add a bank account to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAccount?.id === account.id
                    ? 'border-yeild-yellow bg-yeild-yellow/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectAccount(account)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{account.account_name}</span>
                      {account.is_default && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {account.is_verified ? (
                        <Badge variant="outline" className="text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Manual Verification
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.bank_name} • {account.account_number}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!account.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultBankAccount(user?.id || '', account.id);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBankAccount(account.id).then(() => {
                          setSavedAccounts(prev => prev.filter(acc => acc.id !== account.id));
                          if (selectedAccount?.id === account.id) {
                            onAccountSelect(null);
                          }
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
