
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WithdrawalRequest {
  id: string;
  amount: number;
  payout_method: string;
  payout_details: any;
  status: string;
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
}

export const WithdrawalHistory = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWithdrawals();
    }
  }, [user]);

  const loadWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error("Failed to load withdrawal history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
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
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Withdrawal History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">No withdrawal requests yet</p>
            <p className="text-sm text-muted-foreground">
              Your withdrawal requests will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal, index) => (
              <div key={withdrawal.id}>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {withdrawal.amount.toLocaleString()} points
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ≈ ${((withdrawal.amount * 0.95) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatPayoutMethod(withdrawal.payout_method)}
                        </span>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">
                      {formatDate(withdrawal.requested_at)}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Withdrawal Request Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Amount</label>
                              <p className="text-lg font-semibold">
                                {withdrawal.amount.toLocaleString()} points
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Badge className={getStatusColor(withdrawal.status)}>
                                {withdrawal.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Payout Method</label>
                            <p>{formatPayoutMethod(withdrawal.payout_method)}</p>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Requested Date</label>
                            <p>{formatDate(withdrawal.requested_at)}</p>
                          </div>

                          {withdrawal.processed_at && (
                            <div>
                              <label className="text-sm font-medium">Processed Date</label>
                              <p>{formatDate(withdrawal.processed_at)}</p>
                            </div>
                          )}

                          {withdrawal.admin_notes && (
                            <div>
                              <label className="text-sm font-medium">Admin Notes</label>
                              <p className="text-sm bg-muted p-2 rounded">
                                {withdrawal.admin_notes}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Payout Details</label>
                            <div className="text-sm bg-muted p-2 rounded space-y-1">
                              {withdrawal.payout_method === 'paypal' && (
                                <p><strong>Email:</strong> {withdrawal.payout_details.email}</p>
                              )}
                              {withdrawal.payout_method === 'bank_transfer' && (
                                <>
                                  <p><strong>Account:</strong> ***{withdrawal.payout_details.accountNumber?.slice(-4)}</p>
                                  <p><strong>Routing:</strong> {withdrawal.payout_details.routingNumber}</p>
                                </>
                              )}
                              {withdrawal.payout_method === 'crypto' && (
                                <p><strong>Wallet:</strong> {withdrawal.payout_details.walletAddress?.slice(0, 8)}...{withdrawal.payout_details.walletAddress?.slice(-8)}</p>
                              )}
                              {withdrawal.payout_details.notes && (
                                <p><strong>Notes:</strong> {withdrawal.payout_details.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {index < withdrawals.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
