
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Target, Users, FileText, Globe } from 'lucide-react';

interface BrandCampaign {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  budget: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  admin_approval_status?: string;
  target_audience?: any;
  requirements?: any;
  brand_profiles?: {
    company_name: string;
  } | null;
}

interface BrandCampaignDetailsDialogProps {
  campaign: BrandCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (campaignId: string) => void;
  onReject?: (campaignId: string) => void;
}

export const BrandCampaignDetailsDialog: React.FC<BrandCampaignDetailsDialogProps> = ({
  campaign,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!campaign) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{campaign.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Approval */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
              <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'pending')}>
                {campaign.admin_approval_status?.charAt(0).toUpperCase() + campaign.admin_approval_status?.slice(1) || 'Pending'}
              </Badge>
            </div>
          </div>

          {/* Brand Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Brand</span>
              </div>
              <p className="text-sm text-gray-600">
                {campaign.brand_profiles?.company_name || 'Unknown Brand'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(campaign.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <p className="text-sm text-gray-600">
                {campaign.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <p className="text-sm text-gray-600">
                  ₦{campaign.budget.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-sm text-gray-600">
                  {campaign.start_date && campaign.end_date
                    ? `${new Date(campaign.start_date).toLocaleDateString()} - ${new Date(campaign.end_date).toLocaleDateString()}`
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          {campaign.target_audience && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Target Audience</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(campaign.target_audience, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Requirements */}
          {campaign.requirements && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Requirements</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(campaign.requirements, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          {campaign.admin_approval_status === 'pending' && onApprove && onReject && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => onApprove(campaign.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve Campaign
              </Button>
              <Button
                onClick={() => onReject(campaign.id)}
                variant="destructive"
              >
                Reject Campaign
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
