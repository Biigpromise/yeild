
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  Eye,
  Edit,
  Pause,
  Play,
  Delete
} from 'lucide-react';
import { BrandCampaignActions } from './BrandCampaignActions';

interface CampaignDetailViewProps {
  campaignId: string;
  onBack: () => void;
}

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaignId,
  onBack
}) => {
  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async () => {
      // Fetch campaign analytics
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: submissions } = useQuery({
    queryKey: ['campaign-submissions', campaignId],
    queryFn: async () => {
      // Fetch task submissions for this campaign
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!inner(
            title,
            points,
            brand_user_id
          ),
          profiles(
            name,
            profile_picture_url
          )
        `)
        .eq('tasks.brand_user_id', campaign?.brand_id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!campaign?.brand_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const fundingProgress = campaign.funded_amount / campaign.budget * 100;
  const totalSubmissions = submissions?.length || 0;
  const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
  const pendingSubmissions = submissions?.filter(s => s.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Campaigns
          </Button>
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <p className="text-muted-foreground mt-2">{campaign.description}</p>
        </div>
        <BrandCampaignActions campaign={campaign} onUpdate={refetch} />
      </div>

      {/* Status and Quick Actions */}
      <div className="flex items-center gap-4">
        <Badge className={`px-3 py-1 ${
          campaign.status === 'active' ? 'bg-green-500' : 
          campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
        }`}>
          {campaign.status}
        </Badge>
        <Badge className={`px-3 py-1 ${
          campaign.admin_approval_status === 'approved' ? 'bg-green-500' : 
          campaign.admin_approval_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
        }`}>
          {campaign.admin_approval_status || 'pending'}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold">₦{campaign.budget.toLocaleString()}</p>
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Funded: ₦{(campaign.funded_amount || 0).toLocaleString()}
                  </p>
                  <Progress value={fundingProgress} className="mt-1" />
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
                <p className="text-xs text-green-600">{approvedSubmissions} approved</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{pendingSubmissions}</p>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">{analytics?.length || 0}</p>
                <p className="text-xs text-blue-600">Analytics points</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({totalSubmissions})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-sm">
                    {campaign.start_date 
                      ? new Date(campaign.start_date).toLocaleDateString()
                      : 'Not set'
                    } - {campaign.end_date 
                      ? new Date(campaign.end_date).toLocaleDateString()
                      : 'Open ended'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Target Audience</label>
                  <p className="text-sm">{campaign.target_audience ? 'Defined' : 'General audience'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                  <p className="text-sm">{campaign.requirements ? 'Specific requirements set' : 'General requirements'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approval Rate</span>
                  <span className="text-sm font-medium">
                    {totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Funding Status</span>
                  <span className="text-sm font-medium">{Math.round(fundingProgress)}% funded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days Active</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((new Date().getTime() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Task Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {submission.profiles?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{submission.profiles?.name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">{submission.tasks?.title}</p>
                          </div>
                        </div>
                        <Badge className={
                          submission.status === 'approved' ? 'bg-green-500' :
                          submission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        }>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No submissions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Campaign settings panel coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
