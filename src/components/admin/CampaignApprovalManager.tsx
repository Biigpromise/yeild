
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, DollarSign, Calendar, Target, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  funded_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  brand_id: string;
  created_at: string;
  brand_profiles?: {
    company_name: string;
    industry: string;
  } | null;
}

interface ApprovalDialog {
  open: boolean;
  campaignId: string;
  campaignTitle: string;
  action: 'approve' | 'reject';
  reason: string;
}

export const CampaignApprovalManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<ApprovalDialog>({
    open: false,
    campaignId: '',
    campaignTitle: '',
    action: 'approve',
    reason: ''
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          *,
          brand_profiles:brand_id (
            company_name,
            industry
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform and validate the data
      const transformedData: Campaign[] = (data || []).map(campaign => {
        let brandProfiles: { company_name: string; industry: string; } | null = null;
        
        // Safe handling of brand_profiles with comprehensive type checking
        if (campaign.brand_profiles && 
            campaign.brand_profiles !== null &&
            typeof campaign.brand_profiles === 'object' && 
            !Array.isArray(campaign.brand_profiles) &&
            !('error' in campaign.brand_profiles)) {
          const profiles = campaign.brand_profiles as any;
          if (profiles && 
              typeof profiles.company_name === 'string' && 
              typeof profiles.industry === 'string') {
            brandProfiles = {
              company_name: profiles.company_name,
              industry: profiles.industry
            };
          }
        }

        return {
          id: campaign.id || '',
          title: campaign.title || 'Untitled Campaign',
          description: campaign.description || 'No description provided',
          budget: Number(campaign.budget) || 0,
          funded_amount: Number(campaign.funded_amount) || 0,
          start_date: campaign.start_date || '',
          end_date: campaign.end_date || '',
          status: campaign.status || 'draft',
          admin_approval_status: (campaign.admin_approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
          brand_id: campaign.brand_id || '',
          created_at: campaign.created_at || '',
          brand_profiles: brandProfiles
        };
      });
      
      setCampaigns(transformedData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = (campaignId: string, campaignTitle: string, action: 'approve' | 'reject') => {
    setApprovalDialog({
      open: true,
      campaignId,
      campaignTitle,
      action,
      reason: ''
    });
  };

  const handleApproval = async () => {
    const { campaignId, action, reason } = approvalDialog;
    
    if (action === 'reject' && !reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingId(campaignId);
    try {
      const updateData: any = {
        admin_approval_status: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'approve' ? 'active' : 'rejected'
      };

      if (action === 'reject' && reason.trim()) {
        updateData.rejection_reason = reason.trim();
      }

      const { error } = await supabase
        .from('brand_campaigns')
        .update(updateData)
        .eq('id', campaignId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      toast.success(`Campaign ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setApprovalDialog({ open: false, campaignId: '', campaignTitle: '', action: 'approve', reason: '' });
      loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error(`Failed to ${action} campaign. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Campaign Approvals</h2>
        <Badge variant="outline" className="text-yeild-yellow border-yeild-yellow">
          {campaigns.filter(c => c.admin_approval_status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{campaign.title}</CardTitle>
                  <p className="text-gray-400">
                    by {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                  </p>
                </div>
                <Badge className={`${getStatusColor(campaign.admin_approval_status)} text-white`}>
                  {getStatusIcon(campaign.admin_approval_status)}
                  <span className="ml-1 capitalize">{campaign.admin_approval_status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{campaign.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="text-white font-semibold">₦{campaign.budget.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="text-white">
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Industry</p>
                    <p className="text-white">{campaign.brand_profiles?.industry || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Created: {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Unknown'}
              </div>

              {campaign.admin_approval_status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprovalAction(campaign.id, campaign.title, 'approve')}
                    disabled={processingId === campaign.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Campaign
                  </Button>
                  <Button
                    onClick={() => handleApprovalAction(campaign.id, campaign.title, 'reject')}
                    disabled={processingId === campaign.id}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No campaigns found</p>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === 'approve' ? 'Approve Campaign' : 'Reject Campaign'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Campaign: {approvalDialog.campaignTitle}</p>
            </div>
            
            {approvalDialog.action === 'reject' && (
              <div>
                <Label htmlFor="reason">Reason for rejection *</Label>
                <Textarea
                  id="reason"
                  value={approvalDialog.reason}
                  onChange={(e) => setApprovalDialog({ ...approvalDialog, reason: e.target.value })}
                  placeholder="Please provide a reason for rejecting this campaign..."
                  rows={3}
                />
              </div>
            )}

            {approvalDialog.action === 'approve' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  This campaign will be approved and made active.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApprovalDialog({ ...approvalDialog, open: false })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproval}
              disabled={processingId === approvalDialog.campaignId}
              className={approvalDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processingId === approvalDialog.campaignId ? 'Processing...' : 
               approvalDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
