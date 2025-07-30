
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
import { WalletOverview } from '@/components/wallet/WalletOverview';

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
        .maybeSingle();

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
    <WalletOverview
      userPoints={walletData.balance}
      totalEarned={walletData.total_earned}
      pendingWithdrawals={0}
      completedWithdrawals={walletData.total_spent}
    />
  );
};
