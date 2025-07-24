
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, DollarSign, Users, Calendar, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";
import { useNavigate } from "react-router-dom";
import { CampaignFundingDialog } from "@/components/brand/CampaignFundingDialog";
import { CampaignSubmissionButton } from "@/components/brand/CampaignSubmissionButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const BrandCampaignsTab: React.FC = () => {
  const { campaigns, loading, fetchBrandCampaigns } = useBrandCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showFundingDialog, setShowFundingDialog] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const handleFundCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowFundingDialog(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campaign deleted successfully');
      fetchBrandCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Campaigns</h2>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-card border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="h-6 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Campaigns</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Create and manage your marketing campaigns</p>
        </div>
        <Button 
          onClick={() => navigate('/campaigns/create')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 sm:p-12 text-center">
            <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Start by creating your first campaign to reach our engaged community
            </p>
            <Button 
              onClick={() => navigate('/campaigns/create')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    <CardTitle className="text-lg sm:text-xl text-foreground mb-2 break-words">{campaign.title}</CardTitle>
                    <p className="text-muted-foreground text-sm break-words">{campaign.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(campaign.payment_status || 'unpaid')}>
                      {campaign.payment_status || 'unpaid'}
                    </Badge>
                    <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'pending')}>
                      Admin: {campaign.admin_approval_status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Budget:</span>
                    <span className="font-medium text-foreground">₦{campaign.budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Funded:</span>
                    <span className="font-medium text-foreground">₦{campaign.funded_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="font-medium text-foreground">{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="font-medium text-foreground">{campaign.admin_approval_status || 'pending'}</span>
                  </div>
                </div>

                {campaign.rejection_reason && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-destructive text-sm font-medium">Rejection Reason:</p>
                        <p className="text-destructive text-sm">{campaign.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-border">
                   <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="border-border text-foreground hover:bg-muted flex-1 sm:flex-none"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {campaign.status === 'draft' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                          className="border-border text-foreground hover:bg-muted flex-1 sm:flex-none"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="border-destructive text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {campaign.payment_status !== 'paid' && (
                    <Button
                      onClick={() => handleFundCampaign(campaign)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full sm:w-auto"
                      size="sm"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fund Campaign
                    </Button>
                  )}
                </div>
                
                {/* Campaign Submission Section */}
                <div className="mt-4 pt-4 border-t border-border">
                  <CampaignSubmissionButton
                    campaign={campaign}
                    onSubmissionComplete={fetchBrandCampaigns}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Funding Dialog */}
      <CampaignFundingDialog
        open={showFundingDialog}
        onOpenChange={setShowFundingDialog}
        campaign={selectedCampaign}
        onFundingComplete={() => {
          setShowFundingDialog(false);
          fetchBrandCampaigns();
        }}
      />
    </div>
  );
};
