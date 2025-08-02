
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export const AdminDebugPanel = () => {
  const { user } = useAuth();

  const { data: debugInfo, isLoading } = useQuery({
    queryKey: ['admin-debug-info'],
    queryFn: async () => {
      console.log('🔍 Starting admin debug check...');
      
      // Check current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('👤 Current user:', currentUser?.id, currentUser?.email);
      
      // Check user role using secure function
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_current_user_admin_secure');
      console.log('🔐 Admin check result:', isAdmin, adminError);
      
      // Check user roles table directly
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', currentUser?.id);
      console.log('📋 User roles:', userRoles, rolesError);
      
      // Test data access
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('id, status')
        .limit(1);
      console.log('📝 Task submissions test:', submissions?.length || 0, submissionsError);
      
      const { data: campaigns, error: campaignsError } = await supabase
        .from('brand_campaigns')
        .select('id, status')
        .limit(1);
      console.log('🎯 Brand campaigns test:', campaigns?.length || 0, campaignsError);
      
      const { data: applications, error: applicationsError } = await supabase
        .from('brand_applications')
        .select('id, status')
        .limit(1);
      console.log('📄 Brand applications test:', applications?.length || 0, applicationsError);
      
      // Get dashboard stats - this returns an array, so take first element
      const { data: statsArray, error: statsError } = await supabase.rpc('get_admin_dashboard_stats');
      const stats = statsArray?.[0] || null;
      console.log('📊 Dashboard stats:', stats, statsError);
      
      return {
        user: currentUser,
        isAdmin,
        adminError,
        userRoles,
        rolesError,
        dataAccess: {
          submissions: { count: submissions?.length || 0, error: submissionsError },
          campaigns: { count: campaigns?.length || 0, error: campaignsError },
          applications: { count: applications?.length || 0, error: applicationsError }
        },
        stats,
        statsError
      };
    },
    enabled: !!user?.id,
    retry: 1,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Admin Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading debug information...</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (hasError: boolean, hasData: boolean = false) => {
    if (hasError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (hasData) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Admin Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">User Information</h4>
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {debugInfo?.user?.id || 'Not found'}</p>
              <p><strong>Email:</strong> {debugInfo?.user?.email || 'Not found'}</p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusIcon(!debugInfo?.user)}
                <Badge variant={debugInfo?.user ? "default" : "destructive"}>
                  {debugInfo?.user ? "Authenticated" : "Not authenticated"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">Admin Status</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(!!debugInfo?.adminError, debugInfo?.isAdmin)}
                <Badge variant={debugInfo?.isAdmin ? "default" : "secondary"}>
                  {debugInfo?.isAdmin ? "Admin Access" : "No Admin Access"}
                </Badge>
              </div>
              {debugInfo?.adminError && (
                <p className="text-red-600 text-xs mt-1">
                  Error: {debugInfo.adminError.message}
                </p>
              )}
              <div className="mt-2">
                <p><strong>Roles:</strong> {debugInfo?.userRoles?.length || 0} found</p>
                {debugInfo?.userRoles?.map((role, index) => (
                  <Badge key={index} variant="outline" className="mr-1 text-xs">
                    {role.role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Access Test */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-semibold mb-2">Data Access Test</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!debugInfo?.dataAccess.submissions.error, debugInfo?.dataAccess.submissions.count > 0)}
              <span>Submissions: {debugInfo?.dataAccess.submissions.count}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!debugInfo?.dataAccess.campaigns.error, debugInfo?.dataAccess.campaigns.count > 0)}
              <span>Campaigns: {debugInfo?.dataAccess.campaigns.count}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!debugInfo?.dataAccess.applications.error, debugInfo?.dataAccess.applications.count > 0)}
              <span>Applications: {debugInfo?.dataAccess.applications.count}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {debugInfo?.stats && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">Dashboard Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>Total Submissions: {debugInfo.stats.total_task_submissions}</div>
              <div>Pending: {debugInfo.stats.pending_submissions}</div>
              <div>Campaigns: {debugInfo.stats.total_campaigns}</div>
              <div>Active Campaigns: {debugInfo.stats.active_campaigns}</div>
              <div>Applications: {debugInfo.stats.total_applications}</div>
              <div>Pending Apps: {debugInfo.stats.pending_applications}</div>
            </div>
          </div>
        )}

        {/* Error Details */}
        {(debugInfo?.adminError || debugInfo?.rolesError || debugInfo?.statsError) && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Error Details</h4>
            <div className="text-sm text-red-700 space-y-1">
              {debugInfo?.adminError && (
                <p>Admin Error: {debugInfo.adminError.message}</p>
              )}
              {debugInfo?.rolesError && (
                <p>Roles Error: {debugInfo.rolesError.message}</p>
              )}
              {debugInfo?.statsError && (
                <p>Stats Error: {debugInfo.statsError.message}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
