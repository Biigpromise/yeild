
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Download, RefreshCw, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  amount: number;
  payout_method: string;
  status: string;
  created_at: string;
  payout_details: any;
  updated_at: string;
}

export const WithdrawalHistory: React.FC = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWithdrawals();
    }
  }, [user]);

  const loadWithdrawals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading withdrawals:', error);
        return;
      }

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPayoutMethod = (method: string) => {
    switch (method) {
      case 'flutterwave':
        return 'Bank Transfer';
      case 'yield_wallet':
        return 'Yield Wallet';
      case 'crypto':
        return 'Cryptocurrency';
      case 'gift_card':
        return 'Gift Card';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading withdrawal history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Withdrawal History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No withdrawal history</p>
            <p className="text-sm text-muted-foreground">Your withdrawal requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className="font-medium">{withdrawal.amount.toLocaleString()} Points</span>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Method: {formatPayoutMethod(withdrawal.payout_method)}</div>
                        <div>
                          Requested: {formatDistanceToNow(new Date(withdrawal.created_at), { addSuffix: true })}
                        </div>
                        
                        {withdrawal.payout_method === 'flutterwave' && withdrawal.payout_details && (
                          <div>
                            Account: {withdrawal.payout_details.accountName} 
                            ({withdrawal.payout_details.accountNumber})
                          </div>
                        )}
                        
                        {withdrawal.payout_method === 'yield_wallet' && (
                          <div>Transferred to your Yield Wallet</div>
                        )}
                        
                        {withdrawal.status === 'completed' && (
                          <div className="text-green-600 font-medium">
                            Completed: {formatDistanceToNow(new Date(withdrawal.updated_at), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {withdrawal.amount.toLocaleString()} pts
                      </div>
                      {withdrawal.payout_method === 'flutterwave' && withdrawal.payout_details?.processingFee && (
                        <div className="text-sm text-muted-foreground">
                          Fee: {withdrawal.payout_details.processingFee.toLocaleString()} pts
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
