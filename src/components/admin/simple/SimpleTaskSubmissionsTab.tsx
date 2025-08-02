
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const SimpleTaskSubmissionsTab = () => {
  const { user } = useAuth();

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['admin-task-submissions-simple'],
    queryFn: async () => {
      console.log('🔍 Fetching task submissions as admin...');
      console.log('🔐 Current user:', user?.id);
      
      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      console.log('👤 User role:', userRole);
      
      // Fetch submissions with a simpler query structure
      const { data: submissionData, error: submissionError } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionError) {
        console.error('❌ Task submissions error:', submissionError);
        throw submissionError;
      }

      console.log('✅ Raw submissions data:', submissionData?.length || 0, 'records');

      if (!submissionData || submissionData.length === 0) {
        console.log('ℹ️ No submissions found');
        return [];
      }

      // Get unique task and user IDs
      const taskIds = [...new Set(submissionData.map(s => s.task_id).filter(Boolean))];
      const userIds = [...new Set(submissionData.map(s => s.user_id).filter(Boolean))];
      
      console.log('🎯 Task IDs to fetch:', taskIds.length);
      console.log('👥 User IDs to fetch:', userIds.length);

      // Fetch tasks
      let tasks: any[] = [];
      if (taskIds.length > 0) {
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('id, title, points')
          .in('id', taskIds);
        
        if (taskError) {
          console.warn('⚠️ Task fetch error:', taskError);
        } else {
          tasks = taskData || [];
          console.log('✅ Tasks fetched:', tasks.length);
        }
      }

      // Fetch user profiles
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        
        if (profileError) {
          console.warn('⚠️ Profiles fetch error:', profileError);
        } else {
          profiles = profileData || [];
          console.log('✅ Profiles fetched:', profiles.length);
        }
      }

      // Enrich submissions with related data
      const enrichedSubmissions = submissionData.map(submission => ({
        ...submission,
        task: tasks.find(t => t.id === submission.task_id),
        user: profiles.find(p => p.id === submission.user_id)
      }));

      console.log('✅ Final enriched submissions:', enrichedSubmissions.length);
      return enrichedSubmissions;
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading task submissions...</span>
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
            Task Submissions - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Failed to load task submissions</p>
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

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;
  const approvedCount = submissions?.filter(s => s.status === 'approved').length || 0;
  const rejectedCount = submissions?.filter(s => s.status === 'rejected').length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Submissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{submissions?.length || 0}</p>
                  <p className="text-sm text-blue-600">Total Submissions</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                  <p className="text-sm text-yellow-600">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
                  <p className="text-sm text-red-600">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {!submissions || submissions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No task submissions found</p>
              <p className="text-gray-400 text-sm">Task submissions will appear here when users complete tasks</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  Debug info: User ID: {user?.id}, Admin check performed
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 10).map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{submission.task?.title || 'Unknown Task'}</h4>
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>User:</strong> {submission.user?.name || 'Unknown User'} ({submission.user?.email || 'No email'})</p>
                        <p><strong>Points:</strong> {submission.task?.points || 0} pts</p>
                        <p><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {submissions.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">Showing 10 of {submissions.length} submissions</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
