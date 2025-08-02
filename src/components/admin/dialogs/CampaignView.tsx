import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  DollarSign, 
  Calendar, 
  Users,
  Target,
  ExternalLink,
  Edit,
  Pause,
  Play,
  Trash2
} from 'lucide-react';

interface CampaignViewProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({
  campaign,
  isOpen,
  onClose,
  onEdit,
  onPause,
  onResume,
  onDelete
}) => {
  if (!campaign) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fundingPercentage = campaign.budget ? 
    Math.round((campaign.funded_amount / campaign.budget) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Campaign Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{campaign.title}</h2>
                <p className="text-muted-foreground">
                  by {campaign.brand_profile?.company_name || 'Unknown Brand'}
                </p>
              </div>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            
            {campaign.description && (
              <p className="text-sm text-muted-foreground">{campaign.description}</p>
            )}
          </div>

          {/* Financial Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-lg font-semibold">₦{campaign.budget?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Funded Amount</p>
                <p className="text-lg font-semibold">₦{campaign.funded_amount?.toLocaleString() || 0}</p>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Funding Progress</span>
                <span className="text-sm font-medium">{fundingPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(campaign.created_at).toLocaleDateString()}</p>
              </div>
              {campaign.start_date && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(campaign.start_date).toLocaleDateString()}</p>
                </div>
              )}
              {campaign.end_date && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{new Date(campaign.end_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Technical Information</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Campaign ID:</strong> {campaign.id}</p>
              <p><strong>Brand ID:</strong> {campaign.brand_id}</p>
              {campaign.payment_status && (
                <p><strong>Payment Status:</strong> 
                  <Badge className="ml-2" variant={campaign.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {campaign.payment_status}
                  </Badge>
                </p>
              )}
              {campaign.admin_approval_status && (
                <p><strong>Admin Approval:</strong> 
                  <Badge className="ml-2" variant={campaign.admin_approval_status === 'approved' ? 'default' : 'secondary'}>
                    {campaign.admin_approval_status}
                  </Badge>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end flex-wrap">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(campaign.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {campaign.status === 'active' && onPause && (
              <Button variant="outline" onClick={() => onPause(campaign.id)}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {campaign.status === 'paused' && onResume && (
              <Button variant="outline" onClick={() => onResume(campaign.id)}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="outline" 
                onClick={() => onDelete(campaign.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};