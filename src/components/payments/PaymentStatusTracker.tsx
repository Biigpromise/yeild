import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, XCircle, CreditCard, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentTransaction {
  id: string;
  transaction_ref: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  flutterwave_id?: string;
  amount_settled?: number;
  payment_method?: string;
  created_at: string;
  verified_at?: string;
  campaign_id?: string;
  reward_id?: string;
  task_id?: string;
  customer_email: string;
  customer_name: string;
}

export const PaymentStatusTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserTransactions();
      setupRealTimeSubscription();
    }
  }, [user]);

  const loadUserTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedTransaction = payload.new as PaymentTransaction;
          
          setTransactions(prev => 
            prev.map(t => 
              t.id === updatedTransaction.id ? updatedTransaction : t
            )
          );

          // Show notification for status changes
          if (updatedTransaction.status === 'successful') {
            toast({
              title: "Payment Successful",
              description: `Your payment of ₦${updatedTransaction.amount} has been confirmed`,
            });
          } else if (updatedTransaction.status === 'failed') {
            toast({
              title: "Payment Failed",
              description: `Your payment of ₦${updatedTransaction.amount} could not be processed`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'campaign_funding':
        return 'Campaign Funding';
      case 'reward_purchase':
        return 'Reward Purchase';
      case 'task_payment':
        return 'Task Payment';
      case 'premium_subscription':
        return 'Premium Subscription';
      default:
        return 'General Payment';
    }
  };

  const verifyPayment = async (transactionRef: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('flutterwave-verify', {
        body: { tx_ref: transactionRef }
      });

      if (error) throw error;

      toast({
        title: "Payment Verified",
        description: "Payment status has been updated",
      });

      await loadUserTransactions();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify payment status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading payment history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(transaction.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {getPaymentTypeLabel(transaction.payment_type)}
                        </span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Amount: ₦{transaction.amount.toLocaleString()}</p>
                        <p>Reference: {transaction.transaction_ref}</p>
                        <p>Date: {new Date(transaction.created_at).toLocaleString()}</p>
                        {transaction.payment_method && (
                          <p>Method: {transaction.payment_method}</p>
                        )}
                        {transaction.verified_at && (
                          <p>Verified: {new Date(transaction.verified_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="font-semibold">
                        ₦{(transaction.amount_settled || transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.currency}
                      </div>
                    </div>
                    {transaction.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verifyPayment(transaction.transaction_ref)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
                {index < transactions.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};