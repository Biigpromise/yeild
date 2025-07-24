
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Globe,
  ExternalLink
} from 'lucide-react';
import { BrandApplicationsManager } from './BrandApplicationsManager';
import { toast } from 'sonner';

export const BrandManagement: React.FC = () => {
  const { data: brandStats } = useQuery({
    queryKey: ['brand-stats'],
    queryFn: async () => {
      const { count: totalApplications } = await supabase
        .from('brand_applications')
        .select('*', { count: 'exact', head: true });

      const { count: pendingApplications } = await supabase
        .from('brand_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: approvedBrands } = await supabase
        .from('brand_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: activeCampaigns } = await supabase
        .from('brand_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalApplications: totalApplications || 0,
        pendingApplications: pendingApplications || 0,
        approvedBrands: approvedBrands || 0,
        activeCampaigns: activeCampaigns || 0,
      };
    },
  });

  const { data: activeBrands = [] } = useQuery({
    queryKey: ['active-brands'],
    queryFn: async () => {
      const { data: brands, error: brandsError } = await supabase
        .from('brand_profiles')
        .select('*')
        .limit(10);

      if (brandsError) throw brandsError;

      // Get campaign counts for each brand
      const brandsWithCampaigns = await Promise.all(
        (brands || []).map(async (brand) => {
          const { count: campaignCount } = await supabase
            .from('brand_campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.user_id);

          // Get wallet info for each brand
          const { data: wallet } = await supabase
            .from('brand_wallets')
            .select('balance, total_spent')
            .eq('brand_id', brand.user_id)
            .single();

          return {
            ...brand,
            campaign_count: campaignCount || 0,
            wallet_balance: wallet?.balance || 0,
            total_spent: wallet?.total_spent || 0
          };
        })
      );

      return brandsWithCampaigns;
    },
  });

  const { data: recentCampaigns = [] } = useQuery({
    queryKey: ['recent-brand-campaigns'],
    queryFn: async () => {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('brand_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (campaignsError) throw campaignsError;

      // Get brand info for each campaign
      const campaignsWithBrands = await Promise.all(
        (campaigns || []).map(async (campaign) => {
          const { data: brand } = await supabase
            .from('brand_profiles')
            .select('company_name, logo_url')
            .eq('user_id', campaign.brand_id)
            .single();

          return {
            ...campaign,
            brand_info: brand
          };
        })
      );

      return campaignsWithBrands;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
        <p className="text-muted-foreground">
          Oversee brand applications, profiles, and campaign activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{brandStats?.totalApplications || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{brandStats?.pendingApplications || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Brands</p>
                <p className="text-2xl font-bold text-green-600">{brandStats?.approvedBrands || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-purple-600">{brandStats?.activeCampaigns || 0}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">
            Applications
            {brandStats?.pendingApplications ? (
              <Badge variant="destructive" className="ml-2">
                {brandStats.pendingApplications}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="active-brands">Active Brands</TabsTrigger>
          <TabsTrigger value="campaigns">Recent Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Brand Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <BrandApplicationsManager />
        </TabsContent>

        <TabsContent value="active-brands">
          <Card>
            <CardHeader>
              <CardTitle>Active Brand Partners</CardTitle>
            </CardHeader>
            <CardContent>
              {activeBrands.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active brands found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBrands.map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={brand.logo_url} />
                          <AvatarFallback>
                            <Building2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{brand.company_name}</p>
                          <p className="text-sm text-muted-foreground">{brand.industry}</p>
                          {brand.website && (
                            <div className="flex items-center gap-1 mt-1">
                              <Globe className="h-3 w-3" />
                              <a 
                                href={brand.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {brand.website}
                                <ExternalLink className="h-3 w-3 inline ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="font-medium">₦{brand.wallet_balance?.toLocaleString() || '0'}</p>
                            <p className="text-muted-foreground">Wallet Balance</p>
                          </div>
                          <div>
                            <p className="font-medium">{brand.campaign_count || 0}</p>
                            <p className="text-muted-foreground">Campaigns</p>
                          </div>
                          <div>
                            <p className="font-medium">₦{brand.total_spent?.toLocaleString() || '0'}</p>
                            <p className="text-muted-foreground">Total Spent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Recent Brand Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent campaigns found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={campaign.brand_info?.logo_url} />
                          <AvatarFallback>
                            <Building2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {campaign.brand_info?.company_name || 'Unknown Brand'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={
                              campaign.status === 'active' ? 'bg-green-500' :
                              campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                            }>
                              {campaign.status}
                            </Badge>
                            <Badge className={
                              campaign.admin_approval_status === 'approved' ? 'bg-green-500' :
                              campaign.admin_approval_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                            }>
                              {campaign.admin_approval_status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="font-medium">₦{campaign.budget.toLocaleString()}</p>
                            <p className="text-muted-foreground">Budget</p>
                          </div>
                          <div>
                            <p className="font-medium">₦{(campaign.funded_amount || 0).toLocaleString()}</p>
                            <p className="text-muted-foreground">Funded</p>
                          </div>
                          <div>
                            <p className="font-medium">{new Date(campaign.created_at).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">Created</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Campaign Budget</span>
                    <span className="text-sm font-medium">Real-time data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium">Real-time data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Brand Retention</span>
                    <span className="text-sm font-medium">Real-time data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Brand Revenue</span>
                    <span className="text-sm font-medium">Real-time data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform Commission</span>
                    <span className="text-sm font-medium">Real-time data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Growth Rate</span>
                    <span className="text-sm font-medium">Real-time data</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
