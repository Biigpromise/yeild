
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBankAccounts } from '@/services/bankAccountVerification';
import type { SavedBankAccount } from '@/services/bankAccountVerification';

interface PaymentMethodStatusProps {
  onSetupMethod: (method: string) => void;
}

export const PaymentMethodStatus: React.FC<PaymentMethodStatusProps> = ({
  onSetupMethod
}) => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<SavedBankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBankAccounts();
    }
  }, [user]);

  const loadBankAccounts = async () => {
    if (!user) return;
    
    try {
      const accounts = await getUserBankAccounts(user.id);
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultAccount = bankAccounts.find(account => account.is_default);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Account Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Bank Account</span>
              {defaultAccount ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Setup Required
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetupMethod('bank')}
            >
              {defaultAccount ? 'Manage' : 'Setup'}
            </Button>
          </div>
          {defaultAccount && (
            <div className="text-sm text-muted-foreground">
              {defaultAccount.bank_name} - {defaultAccount.account_number}
            </div>
          )}
        </div>

        {/* Yield Wallet Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Yield Wallet</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetupMethod('yield_wallet')}
            >
              Use
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Internal wallet for instant transfers
          </div>
        </div>

        {/* Coming Soon Methods */}
        <div className="p-4 border border-dashed rounded-lg opacity-60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Crypto & Gift Cards</span>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Bitcoin, Ethereum, Amazon Gift Cards, and more
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
