
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { BankAccountSelector } from './BankAccountSelector';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingFallback } from '@/components/ui/loading-fallback';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { getUserBankAccounts, deleteBankAccount } from '@/services/bankAccountVerification';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const EnhancedBankAccountSelector: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { errorState, handleError, retry, clearError } = useErrorRecovery();

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userAccounts = await getUserBankAccounts(user.id);
      setAccounts(userAccounts);
    } catch (error) {
      handleError(error as Error, 'loading bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const handleDeleteAccount = async (accountId: string) => {
    if (!user) return;
    
    try {
      await deleteBankAccount(accountId);
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast.success('Bank account removed successfully');
    } catch (error) {
      handleError(error as Error, 'deleting bank account');
    }
  };

  const handleAccountAdded = () => {
    setShowAddForm(false);
    loadAccounts();
  };

  if (loading) {
    return <LoadingFallback type="card" message="Loading bank accounts..." />;
  }

  if (errorState.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load bank accounts</span>
          </div>
          <Button 
            onClick={() => retry(loadAccounts)}
            disabled={errorState.isRecovering}
            className="w-full"
          >
            {errorState.isRecovering ? 'Retrying...' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bank Accounts</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No bank accounts added yet
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">{account.account_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.bank_name} • {account.account_number}
                        </div>
                      </div>
                      {account.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Bank Account</CardTitle>
            </CardHeader>
            <CardContent>
              <BankAccountSelector
                onAccountSelect={handleAccountAdded}
                selectedAccount={null}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
};
