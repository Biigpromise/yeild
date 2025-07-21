
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";
import { useNavigate } from "react-router-dom";
import { CampaignFundingDialog } from "@/components/brand/CampaignFundingDialog";

export const BrandCampaignsTab: React.FC = () => {
  const { campaigns, loading, refreshCampaigns } = useBrandCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showFundingDialog, setShowFundingDialog] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFundCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowFundingDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Your Campaigns</h2>
          <Button className="bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow-dark">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Campaigns</h2>
          <p className="text-gray-300">Create and manage your marketing campaigns</p>
        </div>
        <Button 
          onClick={() => navigate('/campaigns/create')}
          className="bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow-dark font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
            <p className="text-gray-400 mb-6">
              Start by creating your first campaign to reach our engaged community
            </p>
            <Button 
              onClick={() => navigate('/campaigns/create')}
              className="bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow-dark font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-gray-700 bg-gray-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-white mb-2">{campaign.title}</CardTitle>
                    <p className="text-gray-400 text-sm">{campaign.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Budget:</span>
                    <span className="font-medium text-white">₦{campaign.budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Funded:</span>
                    <span className="font-medium text-white">₦{campaign.funded_amount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Created:</span>
                    <span className="font-medium text-white">{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className="font-medium text-white">{campaign.admin_approval_status || 'pending'}</span>
                  </div>
                </div>

                {campaign.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-red-400 text-sm">
                      <strong>Rejection Reason:</strong> {campaign.rejection_reason}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {campaign.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {campaign.payment_status !== 'paid' && (
                    <Button
                      onClick={() => handleFundCampaign(campaign)}
                      className="bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow-dark font-semibold"
                      size="sm"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fund Campaign
                    </Button>
                  )}
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
          refreshCampaigns();
        }}
      />
    </div>
  );
};
