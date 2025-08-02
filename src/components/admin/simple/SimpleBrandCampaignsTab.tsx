
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Target, DollarSign, Calendar, AlertCircle, Eye, Play, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const SimpleBrandCampaignsTab = () => {
  const { user } = useAuth();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['admin-brand-campaigns-simple'],
    queryFn: async () => {
      console.log('🔍 Fetching brand campaigns as admin...');
      console.log('🔐 Current user:', user?.id);
      
      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      console.log('👤 User role:', userRole);
      
      // Fetch campaigns with a simpler query structure
      const { data: campaignData, error: campaignError } = await supabase
        .from('brand_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignError) {
        console.error('❌ Brand campaigns error:', campaignError);
        throw campaignError;
      }

      console.log('✅ Raw campaigns data:', campaignData?.length || 0, 'records');

      if (!campaignData || campaignData.length === 0) {
        console.log('ℹ️ No campaigns found');
        return [];
      }

      // Get unique brand IDs
      const brandIds = [...new Set(campaignData.map(c => c.brand_id).filter(Boolean))];
      
      console.log('🏢 Brand IDs to fetch:', brandIds.length);

      // Fetch brand profiles
      let brandProfiles: any[] = [];
      if (brandIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('brand_profiles')
          .select('user_id, company_name')
          .in('user_id', brandIds);
        
        if (profileError) {
          console.warn('⚠️ Brand profiles fetch error:', profileError);
        } else {
          brandProfiles = profileData || [];
          console.log('✅ Brand profiles fetched:', brandProfiles.length);
        }
      }

      // Enrich campaigns with brand profile data
      const enrichedCampaigns = campaignData.map(campaign => ({
        ...campaign,
        brand_profile: brandProfiles.find(bp => bp.user_id === campaign.brand_id)
      }));

      console.log('✅ Final enriched campaigns:', enrichedCampaigns.length);
      return enrichedCampaigns;
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Brand Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading brand campaigns...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('❌ Query error details:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Brand Campaigns - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Failed to load brand campaigns</p>
            <p className="text-red-600 text-sm mt-1">Error: {error.message}</p>
            <p className="text-red-600 text-sm mt-2">
              Please check the console for detailed error logs and verify your admin permissions.
            </p>
            <div className="mt-3">
              <Button 
                onClick={() => window.location.reload()} 
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeCount = campaigns?.filter(c => c.status === 'active').length || 0;
  const pausedCount = campaigns?.filter(c => c.status === 'paused').length || 0;
  const draftCount = campaigns?.filter(c => c.status === 'draft').length || 0;
  const totalBudget = campaigns?.reduce((sum, c) => sum + (Number(c.budget) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Campaigns Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{campaigns?.length || 0}</p>
                  <p className="text-sm text-blue-600">Total Campaigns</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{activeCount}</p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Pause className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-700">{pausedCount}</p>
                  <p className="text-sm text-yellow-600">Paused</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">₦{totalBudget.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Total Budget</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No brand campaigns found</p>
              <p className="text-gray-400 text-sm">Brand campaigns will appear here when brands create them</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  Debug info: User ID: {user?.id}, Admin check performed
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{campaign.title}</h4>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Brand:</strong> {campaign.brand_profile?.company_name || 'Unknown Brand'}</p>
                        <p><strong>Budget:</strong> ₦{Number(campaign.budget || 0).toLocaleString()}</p>
                        <p><strong>Funded:</strong> ₦{Number(campaign.funded_amount || 0).toLocaleString()}</p>
                        <p><strong>Created:</strong> {new Date(campaign.created_at).toLocaleDateString()}</p>
                        {campaign.description && (
                          <p><strong>Description:</strong> {campaign.description.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'active' ? (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
