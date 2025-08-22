import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp,
  Download,
  Upload,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletTabProps {
  userProfile?: any;
  userStats?: {
    points: number;
    totalEarned?: number;
    totalSpent?: number;
  };
}

export const WalletTab: React.FC<WalletTabProps> = ({ userProfile, userStats }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > (userStats?.points || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    // TODO: Implement withdrawal
    toast.success('Withdrawal request submitted!');
    setWithdrawAmount('');
  };

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

  const recentTransactions = [
    {
      id: 1,
      type: 'earned',
      description: 'Task Completion Reward',
      amount: 150,
      date: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'earned',
      description: 'Referral Bonus',
      amount: 50,
      date: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'spent',
      description: 'Reward Redemption',
      amount: -100,
      date: '2 days ago',
      status: 'completed'
    }
  ];

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', fee: '2%', time: '1-3 business days' },
    { id: 'paypal', name: 'PayPal', fee: '3%', time: 'Instant' },
    { id: 'crypto', name: 'Cryptocurrency', fee: '1%', time: '10-30 minutes' }
  ];

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
        {/* Withdrawal Section */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Withdraw Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Amount to Withdraw</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {(userStats?.points || 0).toLocaleString()} points
                  </p>
                </div>

                <div>
                  <Label>Withdrawal Method</Label>
                  <div className="space-y-2 mt-2">
                    {withdrawalMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedMethod === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-muted-foreground">{method.time}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{method.fee}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw}
                  className="w-full"
                  disabled={!withdrawAmount}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Request Withdrawal
                </Button>
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
                  {recentTransactions.map((transaction) => (
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col p-4">
                <Upload className="h-5 w-5 mb-2" />
                <span className="text-sm">Add Funds</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <Download className="h-5 w-5 mb-2" />
                <span className="text-sm">Withdraw</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <Eye className="h-5 w-5 mb-2" />
                <span className="text-sm">View Statement</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-4">
                <CreditCard className="h-5 w-5 mb-2" />
                <span className="text-sm">Payment Methods</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};