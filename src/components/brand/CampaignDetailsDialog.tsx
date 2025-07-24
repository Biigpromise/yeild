import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, Target, Users, Activity, CreditCard } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  admin_approval_status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  funded_amount: number;
}

interface CampaignDetailsDialogProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignDetailsDialog: React.FC<CampaignDetailsDialogProps> = ({
  campaign,
  isOpen,
  onClose,
}) => {
  if (!campaign) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6" />
            {campaign.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="flex flex-wrap gap-4">
            <Badge className={getStatusColor(campaign.status)}>
              Status: {campaign.status}
            </Badge>
            <Badge className={getApprovalColor(campaign.admin_approval_status)}>
              Approval: {campaign.admin_approval_status}
            </Badge>
            <Badge variant={campaign.payment_status === 'paid' ? 'default' : 'secondary'}>
              Payment: {campaign.payment_status}
            </Badge>
          </div>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium text-sm text-muted-foreground">Description</label>
                <p className="mt-1 text-sm leading-relaxed">{campaign.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </label>
                  <p className="text-lg font-medium">${campaign.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Funded Amount
                  </label>
                  <p className="text-lg font-medium">${campaign.funded_amount?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Start Date</label>
                  <p>{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">End Date</label>
                  <p>{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Created</label>
                  <p>{new Date(campaign.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Last Updated</label>
                  <p>{new Date(campaign.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{campaign.budget > 0 ? Math.round((campaign.funded_amount / campaign.budget) * 100) : 0}%</p>
                  <p className="text-sm text-muted-foreground">Budget Utilization</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Engagements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};