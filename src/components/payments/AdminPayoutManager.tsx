import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  account_bank: string;
  account_number: string;
  beneficiary_name: string;
  status: 'pending' | 'processing' | 'successful' | 'failed';
  created_at: string;
  user_name: string;
  user_email: string;
}

interface BulkPayoutFormData {
  account_bank: string;
  account_number: string;
  beneficiary_name: string;
  amount: string;
  currency: string;
  narration: string;
}

export const AdminPayoutManager = () => {
  const { user } = useAuth();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [bulkPayoutData, setBulkPayoutData] = useState<BulkPayoutFormData>({
    account_bank: "",
    account_number: "",
    beneficiary_name: "",
    amount: "",
    currency: "NGN",
    narration: "YIELD Platform Payout"
  });

  useEffect(() => {
    loadPayoutRequests();
  }, []);

  const loadPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          id,
          user_id,
          amount,
          payout_method,
          payout_details,
          status,
          created_at,
          profiles!inner(name, email)
        `)
        .eq('payout_method', 'flutterwave')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests: PayoutRequest[] = data.map(request => {
        const payoutDetails = request.payout_details as any;
        const profile = request.profiles as any;
        
        return {
          id: request.id,
          user_id: request.user_id,
          amount: request.amount,
          currency: payoutDetails?.currency || 'NGN',
          account_bank: payoutDetails?.bankCode || '',
          account_number: payoutDetails?.accountNumber || '',
          beneficiary_name: payoutDetails?.accountName || '',
          status: request.status as any,
          created_at: request.created_at,
          user_name: profile?.name || 'Unknown',
          user_email: profile?.email || ''
        };
      });

      setPayoutRequests(formattedRequests);
    } catch (error) {
      console.error('Error loading payout requests:', error);
      toast.error('Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  const processPayoutRequest = async (requestId: string) => {
    const request = payoutRequests.find(r => r.id === requestId);
    if (!request) return;

    setProcessing(true);

    try {
      const transferPayload = {
        account_bank: request.account_bank,
        account_number: request.account_number,
        amount: request.amount,
        currency: request.currency,
        beneficiary_name: request.beneficiary_name,
        reference: `withdrawal_${requestId}_${Date.now()}`,
        narration: "YIELD Platform Withdrawal",
        meta: {
          user_id: request.user_id,
          withdrawal_id: requestId
        }
      };

      const { data, error } = await supabase.functions
        .invoke('flutterwave-transfer', {
          body: transferPayload
        });

      if (error) throw error;

      toast.success('Payout initiated successfully');
      await loadPayoutRequests();
    } catch (error) {
      console.error('Payout processing error:', error);
      toast.error('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  const processBulkPayout = async () => {
    if (!bulkPayoutData.account_number || !bulkPayoutData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      const transferPayload = {
        account_bank: bulkPayoutData.account_bank,
        account_number: bulkPayoutData.account_number,
        amount: parseFloat(bulkPayoutData.amount),
        currency: bulkPayoutData.currency,
        beneficiary_name: bulkPayoutData.beneficiary_name,
        reference: `bulk_payout_${Date.now()}`,
        narration: bulkPayoutData.narration,
        meta: {
          payment_type: "bulk_payout"
        }
      };

      const { data, error } = await supabase.functions
        .invoke('flutterwave-transfer', {
          body: transferPayload
        });

      if (error) throw error;

      toast.success('Bulk payout initiated successfully');
      setBulkPayoutData({
        account_bank: "",
        account_number: "",
        beneficiary_name: "",
        amount: "",
        currency: "NGN",
        narration: "YIELD Platform Payout"
      });
    } catch (error) {
      console.error('Bulk payout error:', error);
      toast.error('Failed to process bulk payout');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      successful: "default",
      failed: "destructive"
    } as const;

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800", 
      successful: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
        {status === 'processing' && <Download className="h-3 w-3 mr-1" />}
        {status === 'successful' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const filteredRequests = payoutRequests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.account_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payout Management</h2>
        <p className="text-muted-foreground">
          Process user withdrawals and manage bulk payouts via Flutterwave.
        </p>
      </div>

      {/* Bulk Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Bulk Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Code</label>
              <Input
                placeholder="e.g., 044 for Access Bank"
                value={bulkPayoutData.account_bank}
                onChange={(e) => setBulkPayoutData({...bulkPayoutData, account_bank: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <Input
                placeholder="Account number"
                value={bulkPayoutData.account_number}
                onChange={(e) => setBulkPayoutData({...bulkPayoutData, account_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beneficiary Name</label>
              <Input
                placeholder="Account holder name"
                value={bulkPayoutData.beneficiary_name}
                onChange={(e) => setBulkPayoutData({...bulkPayoutData, beneficiary_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={bulkPayoutData.amount}
                onChange={(e) => setBulkPayoutData({...bulkPayoutData, amount: e.target.value})}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Narration</label>
              <Textarea
                placeholder="Payment description"
                value={bulkPayoutData.narration}
                onChange={(e) => setBulkPayoutData({...bulkPayoutData, narration: e.target.value})}
              />
            </div>
          </div>

          <Button 
            onClick={processBulkPayout}
            disabled={processing}
            className="w-full mt-4"
          >
            {processing ? "Processing..." : "Send Bulk Payout"}
          </Button>
        </CardContent>
      </Card>

      {/* Withdrawal Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Withdrawal Requests</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="successful">Successful</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading withdrawal requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{request.user_name}</h4>
                      <p className="text-sm text-muted-foreground">{request.user_email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {request.currency} {request.amount.toLocaleString()}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Account:</span>
                      <p>{request.account_number}</p>
                    </div>
                    <div>
                      <span className="font-medium">Bank:</span>
                      <p>{request.account_bank}</p>
                    </div>
                    <div>
                      <span className="font-medium">Requested:</span>
                      <p>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => processPayoutRequest(request.id)}
                        disabled={processing}
                        size="sm"
                      >
                        {processing ? "Processing..." : "Process Payout"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};