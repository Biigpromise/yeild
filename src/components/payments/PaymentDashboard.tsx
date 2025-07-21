import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PaymentTransaction {
  id: string;
  transaction_ref: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  customer_name: string;
  created_at: string;
  verified_at?: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  pendingPayments: number;
}

export const PaymentDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      // Load payment transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionError) throw transactionError;

      setTransactions(transactionData || []);

      // Calculate stats
      const revenue = transactionData
        ?.filter(t => t.status === 'successful')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      const successful = transactionData?.filter(t => t.status === 'successful').length || 0;
      const pending = transactionData?.filter(t => t.status === 'pending').length || 0;

      setStats({
        totalRevenue: revenue,
        totalTransactions: transactionData?.length || 0,
        successfulPayments: successful,
        pendingPayments: pending
      });

    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (transactionRef: string) => {
    try {
      const { data, error } = await supabase.functions
        .invoke('flutterwave-verify', {
          body: { tx_ref: transactionRef }
        });

      if (error) throw error;

      toast.success('Payment verification completed');
      await loadPaymentData();
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      successful: { 
        icon: CheckCircle, 
        className: "bg-green-100 text-green-800", 
        text: "Successful" 
      },
      pending: { 
        icon: Clock, 
        className: "bg-yellow-100 text-yellow-800", 
        text: "Pending" 
      },
      failed: { 
        icon: AlertCircle, 
        className: "bg-red-100 text-red-800", 
        text: "Failed" 
      }
    };

    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getPaymentTypeColor = (type: string) => {
    const colors = {
      campaign_funding: "bg-blue-100 text-blue-800",
      task_payment: "bg-green-100 text-green-800",
      premium_subscription: "bg-purple-100 text-purple-800",
      general: "bg-gray-100 text-gray-800"
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading payment dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor payment transactions and revenue analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <h3 className="text-2xl font-bold">{stats.totalTransactions}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <h3 className="text-2xl font-bold">{stats.successfulPayments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold">{stats.pendingPayments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{transaction.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Ref: {transaction.transaction_ref}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {transaction.currency} {parseFloat(transaction.amount.toString()).toLocaleString()}
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getPaymentTypeColor(transaction.payment_type)}>
                        {transaction.payment_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {transaction.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyPayment(transaction.transaction_ref)}
                        >
                          Verify Payment
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
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