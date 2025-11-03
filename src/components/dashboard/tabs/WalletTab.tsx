import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Filter,
  CheckCircle
} from 'lucide-react';

interface WalletTabProps {
  userProfile?: any;
  userStats?: {
    points: number;
    totalEarned?: number;
    totalSpent?: number;
  };
}

export const WalletTab: React.FC<WalletTabProps> = ({ userProfile, userStats }) => {
  const navigate = useNavigate();

  const walletStats = [
    {
      title: 'Available Points',
      value: userStats?.points || 0,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%'
    },
    {
      title: 'Total Earned',
      value: userStats?.totalEarned || userStats?.points || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      change: '+24%'
    },
    {
      title: 'Total Spent',
      value: userStats?.totalSpent || 0,
      icon: ArrowDownLeft,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      change: '-8%'
    }
  ];

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // Load real transaction data
  React.useEffect(() => {
    const loadTransactions = async () => {
      if (!userProfile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedTransactions = (data || []).map(transaction => ({
          id: transaction.id,
          type: transaction.points > 0 ? 'earned' : 'spent',
          description: transaction.description || transaction.transaction_type.replace('_', ' '),
          amount: transaction.points,
          date: new Date(transaction.created_at).toLocaleDateString(),
          status: 'completed'
        }));

        setRecentTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    loadTransactions();
  }, [userProfile?.id]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center lg:text-left"
      >
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Your Wallet
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your earnings, withdrawals, and transactions
        </p>
      </motion.div>

      {/* Wallet Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {walletStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Withdrawal Quick Access */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Withdraw Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                    <p className="text-3xl font-bold text-primary">
                      ₦{(userStats?.points || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Paystack: 2% fee, 2-10 min</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Flutterwave: 5% fee, 1-24 hrs</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Yield Wallet: No fees, Instant</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/withdrawal')}
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Start Withdrawal
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Minimum withdrawal: ₦1,000 for bank transfers
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Transaction History
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-full"></div>
                            <div>
                              <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                              <div className="h-3 bg-muted rounded w-20"></div>
                            </div>
                          </div>
                          <div className="h-6 bg-muted rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'earned' 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          {transaction.type === 'earned' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {recentTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start completing tasks to see your earnings!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

    </div>
  );
};