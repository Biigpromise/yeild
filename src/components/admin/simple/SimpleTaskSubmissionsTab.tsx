
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const SimpleTaskSubmissionsTab = () => {
  const { user } = useAuth();

  const { data: submissions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-task-submissions-simple'],
    queryFn: async () => {
      console.log('🔍 Fetching task submissions as admin...');
      console.log('🔐 Current user:', user?.id);
      
      // Verify admin access first
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_current_user_admin_secure');
      console.log('👤 Admin verification result:', isAdmin, adminError);
      
      if (adminError) {
        console.error('❌ Admin verification failed:', adminError);
        throw new Error(`Admin verification failed: ${adminError.message}`);
      }
      
      if (!isAdmin) {
        console.error('❌ User is not admin');
        throw new Error('Admin access required');
      }
      
      // Fetch submissions using the updated RLS policy
      const { data: submissionData, error: submissionError } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks (
            id,
            title,
            points
          ),
          profiles (
            id,
            name,
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (submissionError) {
        console.error('❌ Task submissions query error:', submissionError);
        throw new Error(`Failed to fetch submissions: ${submissionError.message}`);
      }

      console.log('✅ Successfully fetched submissions:', submissionData?.length || 0);
      return submissionData || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000,
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
    console.error('❌ Task submissions error:', error);
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
            <div className="mt-3 flex gap-2">
              <Button 
                onClick={() => refetch()} 
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                size="sm"
                variant="outline"
              >
                Refresh Page
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
          <CardTitle className="flex items-center justify-between">
            <span>Task Submissions Overview</span>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
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
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 10).map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{submission.tasks?.title || 'Unknown Task'}</h4>
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>User:</strong> {submission.profiles?.name || 'Unknown User'} ({submission.profiles?.email || 'No email'})</p>
                        <p><strong>Points:</strong> {submission.tasks?.points || 0} pts</p>
                        <p><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                        {submission.evidence && (
                          <p><strong>Evidence:</strong> {submission.evidence.substring(0, 100)}...</p>
                        )}
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
