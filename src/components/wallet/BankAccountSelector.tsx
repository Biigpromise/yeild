
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Trash2, Star, Search, Building2, Smartphone, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { NIGERIAN_BANKS, getBanksByType, searchBanks, getBankByCode } from '@/services/bankService';
import { 
  verifyBankAccount, 
  saveBankAccount, 
  getUserBankAccounts, 
  setDefaultBankAccount, 
  deleteBankAccount,
  type SavedBankAccount,
  type BankAccountVerificationResult
} from '@/services/bankAccountVerification';

interface BankAccountSelectorProps {
  onAccountSelect: (account: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
  }) => void;
  selectedAccount?: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
  };
}

export const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({
  onAccountSelect,
  selectedAccount
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New account form state
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<BankAccountVerificationResult | null>(null);
  const [saveForFuture, setSaveForFuture] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedAccounts();
    }
  }, [user]);

  const loadSavedAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const accounts = await getUserBankAccounts(user.id);
      setSavedAccounts(accounts);
      
      // Auto-select default account if none is selected
      if (!selectedAccount && accounts.length > 0) {
        const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
        onAccountSelect({
          accountNumber: defaultAccount.accountNumber,
          bankCode: defaultAccount.bankCode,
          bankName: defaultAccount.bankName,
          accountName: defaultAccount.accountName
        });
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!accountNumber || !selectedBankCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedBank = getBankByCode(selectedBankCode);
    if (!selectedBank) {
      toast.error('Please select a valid bank');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyBankAccount(
        accountNumber,
        selectedBankCode,
        selectedBank.name
      );

      setVerificationResult(result);

      if (result.success) {
        toast.success('Account verified successfully!');
        onAccountSelect({
          accountNumber: result.accountNumber,
          bankCode: result.bankCode,
          bankName: result.bankName,
          accountName: result.accountName!
        });
      } else {
        toast.error(result.error || 'Account verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify account');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!user || !verificationResult?.success) return;

    try {
      const savedAccount = await saveBankAccount({
        userId: user.id,
        accountName: verificationResult.accountName!,
        accountNumber: verificationResult.accountNumber,
        bankCode: verificationResult.bankCode,
        bankName: verificationResult.bankName,
        isDefault: savedAccounts.length === 0, // First account becomes default
        isVerified: true
      });

      if (savedAccount) {
        setSavedAccounts(prev => [savedAccount, ...prev]);
        toast.success('Account saved successfully!');
        setActiveTab('saved');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleSetDefault = async (accountId: string) => {
    if (!user) return;

    const success = await setDefaultBankAccount(user.id, accountId);
    if (success) {
      setSavedAccounts(prev => 
        prev.map(acc => ({
          ...acc,
          isDefault: acc.id === accountId
        }))
      );
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const success = await deleteBankAccount(accountId);
    if (success) {
      setSavedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    }
  };

  const filteredBanks = searchQuery 
    ? searchBanks(searchQuery)
    : NIGERIAN_BANKS;

  const traditionalBanks = getBanksByType('traditional');
  const microfinanceBanks = getBanksByType('microfinance');
  const fintechBanks = getBanksByType('fintech');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Bank Account Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved">Saved Accounts</TabsTrigger>
            <TabsTrigger value="new">Add New Account</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading saved accounts...</div>
            ) : savedAccounts.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No saved accounts found. Add a new account to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {savedAccounts.map((account) => (
                  <Card key={account.id} className={`cursor-pointer transition-colors ${
                    selectedAccount?.accountNumber === account.accountNumber ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1"
                          onClick={() => onAccountSelect({
                            accountNumber: account.accountNumber,
                            bankCode: account.bankCode,
                            bankName: account.bankName,
                            accountName: account.accountName
                          })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{account.accountName}</span>
                            {account.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {account.isVerified && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {account.bankName} • {account.accountNumber}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!account.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(account.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-search">Search Banks</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="bank-search"
                    placeholder="Search banks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-select">Select Bank</Label>
                <Select value={selectedBankCode} onValueChange={setSelectedBankCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Traditional Banks
                      </div>
                      {traditionalBanks.filter(bank => 
                        !searchQuery || bank.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </div>
                    
                    <div className="p-2">
                      <div className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Microfinance Banks
                      </div>
                      {microfinanceBanks.filter(bank => 
                        !searchQuery || bank.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </div>

                    <div className="p-2">
                      <div className="font-medium text-sm mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Fintech Banks
                      </div>
                      {fintechBanks.filter(bank => 
                        !searchQuery || bank.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleVerifyAccount}
                disabled={verifying || !accountNumber || !selectedBankCode}
                className="w-full"
              >
                {verifying ? 'Verifying...' : 'Verify Account'}
              </Button>

              {verificationResult && (
                <Alert className={verificationResult.success ? 'border-green-200' : 'border-red-200'}>
                  <div className="flex items-center gap-2">
                    {verificationResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {verificationResult.success ? (
                        <div>
                          <div className="font-medium">Account Verified!</div>
                          <div>Account Name: {verificationResult.accountName}</div>
                          <div>Bank: {verificationResult.bankName}</div>
                          <div>Account Number: {verificationResult.accountNumber}</div>
                        </div>
                      ) : (
                        <div className="text-red-700">
                          {verificationResult.error}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {verificationResult?.success && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="save-account"
                      checked={saveForFuture}
                      onChange={(e) => setSaveForFuture(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="save-account" className="text-sm">
                      Save this account for future withdrawals
                    </Label>
                  </div>
                  
                  {saveForFuture && (
                    <Button onClick={handleSaveAccount} className="w-full">
                      Save Account
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
