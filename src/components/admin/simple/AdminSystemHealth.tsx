import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { CheckCircle, XCircle, AlertTriangle, Database, Shield, Activity } from 'lucide-react';

export const AdminSystemHealth = () => {
  const { user } = useAuth();

  const { data: healthData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      try {
        // Basic connectivity test
        const startTime = Date.now();
        
        // Test admin access
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_current_user_admin_secure');
        const adminTime = Date.now() - startTime;

        // Test database access
        const dbStartTime = Date.now();
        const [usersTest, tasksTest, campaignsTest, applicationsTest] = await Promise.all([
          supabase.from('profiles').select('id').limit(1),
          supabase.from('task_submissions').select('id').limit(1),
          supabase.from('brand_campaigns').select('id').limit(1),
          supabase.from('brand_applications').select('id').limit(1)
        ]);
        const dbTime = Date.now() - dbStartTime;

        // Test dashboard stats function
        const statsStartTime = Date.now();
        const { data: statsArray, error: statsError } = await supabase.rpc('get_admin_dashboard_stats');
        const stats = statsArray?.[0] || null;
        const statsTime = Date.now() - statsStartTime;

        return {
          connectivity: {
            status: 'healthy',
            responseTime: adminTime,
            timestamp: new Date().toISOString()
          },
          adminAccess: {
            status: isAdmin ? 'healthy' : 'error',
            value: isAdmin,
            error: adminError?.message,
            responseTime: adminTime
          },
          databaseAccess: {
            status: 'healthy',
            tests: {
              profiles: { success: !usersTest.error, error: usersTest.error?.message },
              task_submissions: { success: !tasksTest.error, error: tasksTest.error?.message },
              brand_campaigns: { success: !campaignsTest.error, error: campaignsTest.error?.message },
              brand_applications: { success: !applicationsTest.error, error: applicationsTest.error?.message }
            },
            responseTime: dbTime
          },
          dashboardStats: {
            status: stats ? 'healthy' : 'warning',
            data: stats,
            error: statsError?.message,
            responseTime: statsTime
          },
          userSession: {
            status: user ? 'healthy' : 'error',
            userId: user?.id,
            email: user?.email,
            authenticated: !!user
          }
        };
      } catch (err) {
        console.error('Health check error:', err);
        throw err;
      }
    },
    refetchInterval: 30000,
    retry: 1
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingState text="Checking system health..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">Monitor system status and connectivity</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              System Health Check Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-red-700">Error: {error.message}</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Retry Health Check
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Connectivity Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthData?.connectivity?.status || 'error')}
                  <Badge className={getStatusColor(healthData?.connectivity?.status || 'error')}>
                    {healthData?.connectivity?.status || 'Unknown'}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {healthData?.connectivity?.responseTime}ms
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthData?.adminAccess?.status || 'error')}
                    <Badge className={getStatusColor(healthData?.adminAccess?.status || 'error')}>
                      {healthData?.adminAccess?.value ? 'Authorized' : 'Not Authorized'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {healthData?.adminAccess?.responseTime}ms
                  </span>
                </div>
                {healthData?.adminAccess?.error && (
                  <p className="text-sm text-red-600">{healthData.adminAccess.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Database Tables Access */}
          <Card>
            <CardHeader>
              <CardTitle>Database Tables Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData?.databaseAccess?.tests && Object.entries(healthData.databaseAccess.tests).map(([table, test]) => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="font-medium">{table}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.success ? 'healthy' : 'error')}
                      <Badge className={getStatusColor(test.success ? 'healthy' : 'error')}>
                        {test.success ? 'Accessible' : 'Error'}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  Response time: {healthData?.databaseAccess?.responseTime}ms
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Stats Function</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthData?.dashboardStats?.status || 'error')}
                    <Badge className={getStatusColor(healthData?.dashboardStats?.status || 'error')}>
                      {healthData?.dashboardStats?.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
                
                {healthData?.dashboardStats?.data && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Task Submissions: {healthData.dashboardStats.data.total_task_submissions}</div>
                    <div>Pending: {healthData.dashboardStats.data.pending_submissions}</div>
                    <div>Campaigns: {healthData.dashboardStats.data.total_campaigns}</div>
                    <div>Applications: {healthData.dashboardStats.data.total_applications}</div>
                  </div>
                )}
                
                {healthData?.dashboardStats?.error && (
                  <p className="text-sm text-red-600">{healthData.dashboardStats.error}</p>
                )}
                
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  Response time: {healthData?.dashboardStats?.responseTime}ms
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Session */}
          <Card>
            <CardHeader>
              <CardTitle>User Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Authentication</span>
                  <Badge className={getStatusColor(healthData?.userSession?.status || 'error')}>
                    {healthData?.userSession?.authenticated ? 'Authenticated' : 'Not Authenticated'}
                  </Badge>
                </div>
                {healthData?.userSession?.userId && (
                  <div className="text-sm space-y-1">
                    <p><strong>User ID:</strong> {healthData.userSession.userId}</p>
                    <p><strong>Email:</strong> {healthData.userSession.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};