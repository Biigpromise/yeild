import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const AdminDebugTest = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAdminAccess = async () => {
      console.log('🔍 Starting admin debug test...');
      const results: any = {
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      };

      try {
        // Test 1: Check user role
        console.log('Testing user role...');
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id);
        
        results.userRole = { data: roleData, error: roleError?.message };
        console.log('User role result:', results.userRole);

        // Test 2: Test task_submissions access
        console.log('Testing task_submissions access...');
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('task_submissions')
          .select('id, status, submitted_at')
          .limit(5);
        
        results.taskSubmissions = { 
          count: submissionsData?.length || 0, 
          data: submissionsData,
          error: submissionsError?.message 
        };
        console.log('Task submissions result:', results.taskSubmissions);

        // Test 3: Test brand_campaigns access
        console.log('Testing brand_campaigns access...');
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('brand_campaigns')
          .select('id, title, status, created_at')
          .limit(5);
        
        results.brandCampaigns = { 
          count: campaignsData?.length || 0, 
          data: campaignsData,
          error: campaignsError?.message 
        };
        console.log('Brand campaigns result:', results.brandCampaigns);

        // Test 4: Test profiles access
        console.log('Testing profiles access...');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .limit(5);
        
        results.profiles = { 
          count: profilesData?.length || 0, 
          data: profilesData,
          error: profilesError?.message 
        };
        console.log('Profiles result:', results.profiles);

        // Test 5: Test tasks access
        console.log('Testing tasks access...');
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, points')
          .limit(5);
        
        results.tasks = { 
          count: tasksData?.length || 0, 
          data: tasksData,
          error: tasksError?.message 
        };
        console.log('Tasks result:', results.tasks);

      } catch (error) {
        console.error('Debug test error:', error);
        results.globalError = error.message;
      }

      setDebugInfo(results);
      setLoading(false);
      console.log('🔍 Admin debug test completed:', results);
    };

    if (user?.id) {
      testAdminAccess();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔍 Admin Debug Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Running debug tests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Admin Debug Test Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">User Info:</h4>
          <p><strong>ID:</strong> {debugInfo.userId}</p>
          <p><strong>Email:</strong> {debugInfo.userEmail}</p>
          <p><strong>Role:</strong> {debugInfo.userRole?.data?.[0]?.role || 'No role found'}</p>
          {debugInfo.userRole?.error && (
            <p className="text-red-500"><strong>Role Error:</strong> {debugInfo.userRole.error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Task Submissions:</h4>
            <p><strong>Count:</strong> {debugInfo.taskSubmissions?.count || 0}</p>
            {debugInfo.taskSubmissions?.error && (
              <p className="text-red-500"><strong>Error:</strong> {debugInfo.taskSubmissions.error}</p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Brand Campaigns:</h4>
            <p><strong>Count:</strong> {debugInfo.brandCampaigns?.count || 0}</p>
            {debugInfo.brandCampaigns?.error && (
              <p className="text-red-500"><strong>Error:</strong> {debugInfo.brandCampaigns.error}</p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Profiles:</h4>
            <p><strong>Count:</strong> {debugInfo.profiles?.count || 0}</p>
            {debugInfo.profiles?.error && (
              <p className="text-red-500"><strong>Error:</strong> {debugInfo.profiles.error}</p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Tasks:</h4>
            <p><strong>Count:</strong> {debugInfo.tasks?.count || 0}</p>
            {debugInfo.tasks?.error && (
              <p className="text-red-500"><strong>Error:</strong> {debugInfo.tasks.error}</p>
            )}
          </div>
        </div>

        {debugInfo.globalError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Global Error:</h4>
            <p className="text-red-700">{debugInfo.globalError}</p>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Console Instructions:</h4>
          <p className="text-green-700">Check the browser console for detailed debug logs with 🔍 prefix.</p>
        </div>
      </CardContent>
    </Card>
  );
};