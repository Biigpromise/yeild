import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X, Eye, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const CampaignApprovalManager: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          *,
          brand_profiles!inner(company_name, user_id),
          brand_wallets!inner(balance)
        `)
        .eq('admin_approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching pending campaigns:', error);
      toast.error('Failed to load pending campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const handleApprove = async (campaignId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('campaign-workflow', {
        body: {
          campaign_id: campaignId,
          action: 'approve',
          admin_id: user?.id
        }
      });

      if (error) throw error;

      toast.success('Campaign approved successfully!');
      fetchPendingCampaigns();
    } catch (error: any) {
      console.error('Error approving campaign:', error);
      toast.error('Failed to approve campaign: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (campaignId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('campaign-workflow', {
        body: {
          campaign_id: campaignId,
          action: 'reject',
          reason: rejectionReason,
          admin_id: user?.id
        }
      });

      if (error) throw error;

      toast.success('Campaign rejected and refund processed');
      setRejectionReason('');
      setSelectedCampaign(null);
      fetchPendingCampaigns();
    } catch (error: any) {
      console.error('Error rejecting campaign:', error);
      toast.error('Failed to reject campaign: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campaign Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve brand campaign submissions
            {campaigns.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {campaigns.length} pending
              </Badge>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={fetchPendingCampaigns}>
          Refresh
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No pending approvals</h3>
            <p className="text-muted-foreground">All campaigns have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-border bg-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-foreground">{campaign.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Clock className="h-4 w-4 mr-1" />
                    Pending Approval
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{campaign.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Budget: ${campaign.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Payment: {campaign.payment_status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      Wallet Balance: ${campaign.brand_wallets?.balance || 0}
                    </span>
                  </div>
                </div>

                {campaign.logo_url && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={campaign.logo_url} 
                      alt="Campaign logo" 
                      className="w-16 h-16 object-contain border rounded"
                    />
                    <span className="text-sm text-muted-foreground">Campaign Logo</span>
                  </div>
                )}

                {/* Financial Verification */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Financial Verification</h4>
                  <div className="text-sm text-blue-800">
                    {campaign.payment_status === 'paid' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Campaign is fully funded
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Campaign funding incomplete
                      </div>
                    )}
                    
                    {campaign.brand_wallets && campaign.brand_wallets.balance >= campaign.budget ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Sufficient wallet balance (${campaign.brand_wallets.balance})
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Insufficient wallet balance
                      </div>
                    )}
                  </div>
                </div>

                {selectedCampaign === campaign.id ? (
                  <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900">Reject Campaign</h4>
                    <Textarea
                      placeholder="Provide a detailed reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleReject(campaign.id)}
                        variant="destructive"
                        disabled={!rejectionReason.trim() || actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Confirm Rejection & Refund'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedCampaign(null);
                          setRejectionReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-red-600">
                      Note: Rejecting will automatically refund ${campaign.budget} to the brand's wallet.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(campaign.id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Processing...' : 'Approve Campaign'}
                    </Button>
                    <Button 
                      onClick={() => setSelectedCampaign(campaign.id)}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Campaign
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};