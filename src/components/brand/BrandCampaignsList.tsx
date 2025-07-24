
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrandCampaignActions } from './BrandCampaignActions';
import { DollarSign, Calendar, Target, AlertCircle } from 'lucide-react';

export const BrandCampaignsList: React.FC = () => {
  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['brand-campaigns-list'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No campaigns found</p>
        <p className="text-sm text-gray-400 mt-2">
          Create your first campaign to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{campaign.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Badge className={getApprovalStatusColor(campaign.admin_approval_status || 'pending')}>
                    {campaign.admin_approval_status || 'pending'}
                  </Badge>
                  {campaign.admin_approval_status === 'rejected' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Needs attention</span>
                    </div>
                  )}
                </div>
              </div>
              <BrandCampaignActions 
                campaign={campaign} 
                onUpdate={() => refetch()} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">₦{campaign.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  {campaign.start_date 
                    ? `Starts: ${new Date(campaign.start_date).toLocaleDateString()}`
                    : 'No start date'
                  }
                </span>
              </div>
            </div>
            
            {campaign.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {campaign.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
