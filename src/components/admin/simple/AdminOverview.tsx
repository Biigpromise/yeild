import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { Users, FileText, Building, AlertTriangle } from 'lucide-react';

export const AdminOverview = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      // Verify admin access
      const { data: isAdmin } = await supabase.rpc('is_current_user_admin_secure');
      if (!isAdmin) throw new Error('Admin access required');

      // Get overview stats
      const [usersRes, submissionsRes, campaignsRes, applicationsRes] = await Promise.all([
        supabase.from('profiles').select('id').limit(1000),
        supabase.from('task_submissions').select('id, status').limit(1000),
        supabase.from('brand_campaigns').select('id, status').limit(1000),
        supabase.from('brand_applications').select('id, status').limit(1000)
      ]);

      return {
        totalUsers: usersRes.data?.length || 0,
        totalSubmissions: submissionsRes.data?.length || 0,
        pendingSubmissions: submissionsRes.data?.filter(s => s.status === 'pending').length || 0,
        totalCampaigns: campaignsRes.data?.length || 0,
        activeCampaigns: campaignsRes.data?.filter(c => c.status === 'active').length || 0,
        totalApplications: applicationsRes.data?.length || 0,
        pendingApplications: applicationsRes.data?.filter(a => a.status === 'pending').length || 0
      };
    },
    refetchInterval: 30000
  });

  if (isLoading) return <LoadingState text="Loading overview..." />;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Task Submissions',
      value: stats?.totalSubmissions || 0,
      subtitle: `${stats?.pendingSubmissions || 0} pending`,
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Brand Campaigns',
      value: stats?.totalCampaigns || 0,
      subtitle: `${stats?.activeCampaigns || 0} active`,
      icon: Building,
      color: 'text-purple-600'
    },
    {
      title: 'Brand Applications',
      value: stats?.totalApplications || 0,
      subtitle: `${stats?.pendingApplications || 0} pending`,
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Overview</h2>
        <p className="text-muted-foreground">Platform statistics and quick metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};