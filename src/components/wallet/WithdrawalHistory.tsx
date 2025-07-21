
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, AlertCircle, CreditCard, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface WithdrawalRequest {
  id: string;
  amount: number;
  payout_method: string;
  status: string;
  created_at: string;
  processed_at?: string;
  payout_details: any;
  admin_notes?: string;
}

export const WithdrawalHistory: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

  useEffect(() => {
    if (user) {
      loadWithdrawalHistory();
    }
  }, [user]);

  const loadWithdrawalHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading withdrawal history:', error);
        toast.error('Failed to load withdrawal history');
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
      toast.error('Failed to load withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
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

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  );

  const handleViewDetails = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading withdrawal history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Withdrawal History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadWithdrawalHistory}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No withdrawal requests found</p>
              <p className="text-sm">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="font-medium">
                          {request.amount.toLocaleString()} points
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(request.payout_method)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Requested:</span>{' '}
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </div>
                    {request.processed_at && (
                      <div>
                        <span className="font-medium">Processed:</span>{' '}
                        {formatDistanceToNow(new Date(request.processed_at), { addSuffix: true })}
                      </div>
                    )}
                  </div>

                  {request.payout_details && request.payout_method === 'flutterwave' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm">
                        <div className="font-medium">Bank Details:</div>
                        <div>Bank: {request.payout_details.bankName}</div>
                        <div>Account: {request.payout_details.accountNumber}</div>
                        <div>Name: {request.payout_details.accountName}</div>
                      </div>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm">
                        <div className="font-medium text-blue-900">Admin Notes:</div>
                        <div className="text-blue-700">{request.admin_notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Amount:</label>
                  <p>{selectedRequest.amount.toLocaleString()} points</p>
                </div>
                <div>
                  <label className="font-medium">Status:</label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <label className="font-medium">Method:</label>
                  <p>{getPaymentMethodLabel(selectedRequest.payout_method)}</p>
                </div>
                <div>
                  <label className="font-medium">Request ID:</label>
                  <p className="text-sm font-mono">{selectedRequest.id}</p>
                </div>
              </div>

              {selectedRequest.payout_details && (
                <div>
                  <label className="font-medium">Payout Details:</label>
                  <pre className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    {JSON.stringify(selectedRequest.payout_details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
