
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
import { 
  Calendar, 
  DollarSign, 
  Target, 
  Users, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

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
  target_audience?: any;
  requirements?: any;
  rejection_reason?: string;
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
      case 'draft':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{campaign.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1">{campaign.status}</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Admin Approval</div>
                    <Badge className={getApprovalStatusColor(campaign.admin_approval_status)}>
                      {getStatusIcon(campaign.admin_approval_status)}
                      <span className="ml-1">{campaign.admin_approval_status}</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Payment</div>
                    <Badge className={getPaymentStatusColor(campaign.payment_status)}>
                      {getStatusIcon(campaign.payment_status)}
                      <span className="ml-1">{campaign.payment_status}</span>
                    </Badge>
                  </div>
                </div>

                {campaign.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                      <XCircle className="h-4 w-4" />
                      Rejection Reason
                    </div>
                    <p className="text-sm text-red-700">{campaign.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {campaign.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Target Audience */}
            {campaign.target_audience && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {typeof campaign.target_audience === 'string' 
                      ? campaign.target_audience 
                      : campaign.target_audience.description || 'No target audience specified.'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {campaign.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {typeof campaign.requirements === 'string' 
                      ? campaign.requirements 
                      : campaign.requirements.description || 'No requirements specified.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Budget</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₦{campaign.budget.toLocaleString()}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Funded Amount</div>
                  <div className="text-lg font-semibold">
                    ₦{campaign.funded_amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Remaining</div>
                  <div className="text-lg font-semibold">
                    ₦{(campaign.budget - campaign.funded_amount).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>
                {campaign.start_date && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                    <div className="text-sm">
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {campaign.end_date && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">End Date</div>
                    <div className="text-sm">
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                  <div className="text-sm">
                    {new Date(campaign.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign ID */}
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">Campaign ID</div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {campaign.id}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
