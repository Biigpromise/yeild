import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { Eye, DollarSign, Calendar } from 'lucide-react';

export const AdminCampaignsSimple = () => {
  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-campaigns-simple'],
    queryFn: async () => {
      const { data: isAdmin } = await supabase.rpc('is_current_user_admin_secure');
      if (!isAdmin) throw new Error('Admin access required');

      const { data: campaignData, error: campaignError } = await supabase
        .from('brand_campaigns')
        .select(`
          id,
          title,
          description,
          brand_id,
          budget,
          funded_amount,
          status,
          created_at,
          start_date,
          end_date
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (campaignError) throw campaignError;

      // Fetch brand profiles separately
      const brandIds = [...new Set(campaignData?.map(c => c.brand_id).filter(Boolean))];
      const { data: brandProfilesData } = await supabase
        .from('brand_profiles')
        .select('user_id, company_name')
        .in('user_id', brandIds);

      return campaignData?.map(campaign => ({
        ...campaign,
        brand_profile: brandProfilesData?.find(b => b.user_id === campaign.brand_id) || null
      })) || [];
    },
    refetchInterval: 30000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingState text="Loading brand campaigns..." />;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Campaigns</h2>
          <p className="text-muted-foreground">Manage and monitor brand campaigns</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No campaigns found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by {campaign.brand_profile?.company_name || 'Unknown Brand'}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">
                      {campaign.description.length > 100 
                        ? `${campaign.description.substring(0, 100)}...` 
                        : campaign.description
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Budget: ₦{campaign.budget?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span>Funded: ₦{campaign.funded_amount?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                    {campaign.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Starts: {new Date(campaign.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};