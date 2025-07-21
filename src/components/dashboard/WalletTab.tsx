
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { WithdrawalButton } from '@/components/wallet/WithdrawalButton';
import { PaymentMethodsButton } from '@/components/wallet/PaymentMethodsButton';

interface WalletData {
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export const WalletTab: React.FC = () => {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    total_earned: 0,
    total_spent: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
      loadTransactions();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('yield_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading wallet:', error);
        return;
      }

      if (data) {
        setWalletData(data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'task_completion':
      case 'referral_bonus':
      case 'achievement':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'reward_redemption':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (points: number) => {
    return points > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">Loading wallet...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              YIELD Wallet
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-yeild-yellow/10 to-yellow-400/10 rounded-lg">
            <div className="text-3xl font-bold text-yeild-yellow mb-2">
              {showBalance ? `${walletData.balance} Points` : '••• Points'}
            </div>
            <p className="text-muted-foreground">Available Balance</p>
          </div>

          {/* Wallet Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {showBalance ? walletData.total_earned : '•••'}
                </div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {showBalance ? walletData.total_spent : '•••'}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <WithdrawalButton userPoints={walletData.balance} />
            <PaymentMethodsButton />
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Complete tasks to start earning points</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getTransactionColor(transaction.points)}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.transaction_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
