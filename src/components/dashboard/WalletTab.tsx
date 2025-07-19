
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PointTransaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface WalletTabProps {
  userPoints: number;
}

export const WalletTab: React.FC<WalletTabProps> = ({ userPoints }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = () => {
    if (userPoints < 500) {
      toast.error('Minimum withdrawal amount is 500 points');
      return;
    }
    
    setWithdrawalRequested(true);
    toast.success('Withdrawal request submitted! Our team will contact you within 24 hours.');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'task_completion':
      case 'referral_bonus':
      case 'achievement':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'reward_redemption':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'task_completion':
      case 'referral_bonus':
      case 'achievement':
        return 'text-green-600';
      case 'reward_redemption':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate earnings for current month
  const currentMonth = new Date().getMonth();
  const monthlyEarnings = transactions
    .filter(t => {
      const transDate = new Date(t.created_at);
      return transDate.getMonth() === currentMonth && t.points > 0;
    })
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-medium">Current Balance</span>
            </div>
            <div className="text-2xl font-bold text-primary">{userPoints.toLocaleString()} Points</div>
            <div className="text-sm text-muted-foreground">≈ ${(userPoints / 100).toFixed(2)} USD</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">This Month</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{monthlyEarnings.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Points earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
            <div className="text-sm text-muted-foreground">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Withdrawal Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Cash Out Your Points</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Convert your points to cash! Minimum withdrawal: 500 points ($5.00)
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleWithdrawRequest}
                disabled={userPoints < 500 || withdrawalRequested}
              >
                {withdrawalRequested ? 'Request Submitted' : 'Request Withdrawal'}
              </Button>
              <Button variant="outline">
                View Payment Methods
              </Button>
            </div>
          </div>

          {userPoints < 500 && (
            <div className="text-sm text-muted-foreground">
              Earn {500 - userPoints} more points to unlock withdrawals!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownLeft className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <h4 className="font-medium mb-1">No transactions yet</h4>
              <p className="text-sm text-muted-foreground">
                Complete tasks to start earning points!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="p-2 rounded-full bg-muted">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{formatTransactionType(transaction.transaction_type)}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description || 'No description'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points} pts
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
