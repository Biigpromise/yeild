
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, DollarSign, Calendar, User, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CampaignApprovalRequest {
  id: string;
  campaign_id: string;
  brand_id: string;
  payment_amount: number;
  payment_transaction_id: string;
  request_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  brand_campaigns: {
    title: string;
    description: string;
    budget: number;
    payment_status: string;
    admin_approval_status: string;
    target_audience: any;
    requirements: any;
  };
  payment_transactions: {
    status: string;
    customer_name: string;
    customer_email: string;
    payment_method: string;
  };
}

export const CampaignApprovalTab = () => {
  const [requests, setRequests] = useState<CampaignApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const fetchApprovalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_approval_requests')
        .select(`
          *,
          brand_campaigns (
            title,
            description,
            budget,
            payment_status,
            admin_approval_status,
            target_audience,
            requirements
          ),
          payment_transactions (
            status,
            customer_name,
            customer_email,
            payment_method
          )
        `)
        .eq('request_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching approval requests:', error);
      toast.error('Failed to fetch approval requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const handleApproval = async (requestId: string, campaignId: string, approve: boolean) => {
    setProcessingId(requestId);

    try {
      // Update campaign approval status
      const { error: campaignError } = await supabase
        .from('brand_campaigns')
        .update({
          admin_approval_status: approve ? 'approved' : 'rejected',
          status: approve ? 'active' : 'draft',
          approved_at: approve ? new Date().toISOString() : null,
          rejection_reason: approve ? null : rejectionReason
        })
        .eq('id', campaignId);

      if (campaignError) throw campaignError;

      // Update approval request status
      const { error: requestError } = await supabase
        .from('campaign_approval_requests')
        .update({
          request_status: approve ? 'approved' : 'rejected'
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      toast.success(`Campaign ${approve ? 'approved' : 'rejected'} successfully`);
      
      // Refresh the list
      fetchApprovalRequests();
      
      // Reset states
      setSelectedRequest(null);
      setRejectionReason('');

    } catch (error: any) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black">Campaign Approvals</h2>
        <p className="text-gray-600">Review and approve paid brand campaigns</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">No pending approvals</h3>
            <p className="text-gray-600">All campaigns have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-black">
                      {request.brand_campaigns.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      {request.brand_campaigns.description}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="font-medium text-black">
                      ₦{request.payment_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Brand:</span>
                    <span className="font-medium text-black">
                      {request.payment_transactions?.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="font-medium text-black">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        request.payment_transactions?.status === 'successful' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      Payment: {request.payment_transactions?.status}
                    </Badge>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-black mb-2">Campaign Details</h4>
                  {request.brand_campaigns.target_audience && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Target Audience:</span>
                      <p className="text-sm text-gray-600">
                        {request.brand_campaigns.target_audience.description}
                      </p>
                    </div>
                  )}
                  {request.brand_campaigns.requirements && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Requirements:</span>
                      <p className="text-sm text-gray-600">
                        {request.brand_campaigns.requirements.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rejection Reason Input */}
                {selectedRequest === request.id && (
                  <div className="mb-4">
                    <Label htmlFor="rejectionReason" className="text-black">
                      Rejection Reason (Required)
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejecting this campaign"
                      rows={3}
                      className="border-gray-300"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/campaigns/${request.campaign_id}`, '_blank')}
                    className="border-gray-300"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  <div className="flex items-center gap-2">
                    {selectedRequest === request.id ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(null);
                            setRejectionReason('');
                          }}
                          className="border-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleApproval(request.id, request.campaign_id, false)}
                          disabled={processingId === request.id || !rejectionReason.trim()}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          {processingId === request.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Rejecting...
                            </div>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Confirm Rejection
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => setSelectedRequest(request.id)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApproval(request.id, request.campaign_id, true)}
                          disabled={processingId === request.id}
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          {processingId === request.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Approving...
                            </div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Campaign
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
