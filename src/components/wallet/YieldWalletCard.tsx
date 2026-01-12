import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PiggyBank, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface YieldWallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
}

interface YieldTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export const YieldWalletCard: React.FC = () => {
  const { user } = useAuth();
  const [yieldWallet, setYieldWallet] = useState<YieldWallet | null>(null);
  const [transactions, setTransactions] = useState<YieldTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (user) {
      loadYieldWallet();
      loadTransactions();
    }
  }, [user]);

  const loadYieldWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('yield_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setYieldWallet(data);
    } catch (error) {
      console.error('Error loading yield wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!yieldWallet) return;
    try {
      const { data, error } = await supabase
        .from('yield_wallet_transactions')
        .select('*')
        .eq('wallet_id', yieldWallet.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    if (yieldWallet) {
      loadTransactions();
    }
  }, [yieldWallet]);

  const formatCurrency = (amount: number) => {
    return showBalance ? `₦${amount.toLocaleString()}` : '₦****';
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!yieldWallet) {
    return (
      <Card className="border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <PiggyBank className="h-12 w-12 mx-auto mb-4 text-primary/60" />
          <h3 className="font-semibold mb-2">Yield Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Transfer credits to your Yield Wallet to save and grow your earnings.
          </p>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PiggyBank className="h-5 w-5 text-green-600" />
            Yield Wallet
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={loadYieldWallet}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(yieldWallet.balance)}
          </p>
          <p className="text-sm text-muted-foreground">Available Balance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <ArrowDownRight className="h-4 w-4" />
              <span className="font-semibold">{formatCurrency(yieldWallet.total_earned)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Deposited</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <ArrowUpRight className="h-4 w-4" />
              <span className="font-semibold">{formatCurrency(yieldWallet.total_spent)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Activity</p>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm bg-background/30 rounded p-2">
                  <span className="truncate flex-1">{tx.description}</span>
                  <span className={tx.transaction_type === 'deposit' ? 'text-green-600' : 'text-orange-600'}>
                    {tx.transaction_type === 'deposit' ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
          <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">
            Save your credits in Yield Wallet for future use
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
