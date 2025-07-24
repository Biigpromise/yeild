
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBrandCampaigns } from '@/hooks/useBrandCampaigns';
import { BrandCampaignDetailsDialog } from './BrandCampaignDetailsDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, DollarSign, Calendar, Building2 } from 'lucide-react';

export const BrandCampaignsManagement: React.FC = () => {
  const { campaigns, loading, fetchBrandCampaigns } = useBrandCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleViewDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsDetailsOpen(true);
  };

  const handleApprove = async (campaignId: string) => {
    setProcessingId(campaignId);
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .update({
          admin_approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campaign approved successfully');
      fetchBrandCampaigns();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast.error('Failed to approve campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (campaignId: string) => {
    setProcessingId(campaignId);
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .update({
          admin_approval_status: 'rejected',
          approved_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campaign rejected');
      fetchBrandCampaigns();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      toast.error('Failed to reject campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const pendingCampaigns = campaigns.filter(c => c.admin_approval_status === 'pending');
  const approvedCampaigns = campaigns.filter(c => c.admin_approval_status === 'approved');
  const rejectedCampaigns = campaigns.filter(c => c.admin_approval_status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Brand Campaigns</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {pendingCampaigns.length} Pending
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {approvedCampaigns.length} Approved
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-600">
            {rejectedCampaigns.length} Rejected
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCampaigns.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCampaigns.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingCampaigns.map((campaign) => (
              <Card key={campaign.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'pending')}>
                        {campaign.admin_approval_status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">₦{campaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'No start date'}
                      </span>
                    </div>
                  </div>

                  {campaign.description && (
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {campaign.description}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(campaign)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(campaign.id)}
                      disabled={processingId === campaign.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReject(campaign.id)}
                      disabled={processingId === campaign.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pendingCampaigns.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No pending campaigns</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid gap-4">
            {approvedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Budget: ₦{campaign.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'approved')}>
                        Approved
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {approvedCampaigns.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No approved campaigns</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {rejectedCampaigns.map((campaign) => (
              <Card key={campaign.id} className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Budget: ₦{campaign.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'rejected')}>
                        Rejected
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {rejectedCampaigns.length === 0 && (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No rejected campaigns</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <BrandCampaignDetailsDialog
        campaign={selectedCampaign}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
