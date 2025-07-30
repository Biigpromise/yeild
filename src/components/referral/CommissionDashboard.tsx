import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { referralCommissionService } from '@/services/referralCommissionService';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Coins } from 'lucide-react';

interface CommissionTransaction {
  points: number;
  created_at: string;
  description: string;
}

export const CommissionDashboard = () => {
  const { user } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCommissionData();
    }
  }, [user]);

  const loadCommissionData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [total, transactions] = await Promise.all([
        referralCommissionService.getTotalCommissionEarnings(user.id),
        referralCommissionService.getCommissionEarnings(user.id)
      ]);

      setTotalEarnings(total);
      setRecentTransactions(transactions.slice(0, 5)); // Show last 5 transactions
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Commission Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Commission Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Earnings */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Commission Earned</p>
              <p className="text-2xl font-bold">{totalEarnings} points</p>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">How it works</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You earn <Badge variant="secondary" className="mx-1">10 points</Badge> 
            every time someone you referred completes a task and earns points.
          </p>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Recent Commission Earnings</h4>
            <div className="space-y-2">
              {recentTransactions.map((transaction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">+{transaction.points} points</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Commission
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentTransactions.length === 0 && (
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No commission earnings yet. Share your referral link to start earning!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};