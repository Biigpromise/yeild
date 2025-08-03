import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const TaskSubmissionsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: submissions, isLoading, error: queryError } = useQuery({
    queryKey: ['admin-task-submissions'],
    queryFn: async () => {
      console.log('Fetching task submissions...');
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!task_submissions_task_id_fkey!inner(title, description, points)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Task submissions query error:', error);
        throw error;
      }

      // Get user profiles separately since there's no direct FK relationship
      const userIds = data?.map(submission => submission.user_id).filter(Boolean) || [];
      let profiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        profiles = profileData || [];
      }

      // Merge the data
      const enrichedData = data?.map(submission => ({
        ...submission,
        user_profile: profiles.find(profile => profile.id === submission.user_id)
      }));

      console.log('Task submissions data:', enrichedData);
      return enrichedData;
    },
  });

  // Show query error if exists
  if (queryError) {
    console.error('Query error:', queryError);
  }

  const updateSubmissionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('task_submissions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-task-submissions'] });
      toast.success('Submission status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update submission status');
      console.error('Error updating submission:', error);
    },
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

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = 
      submission.tasks?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <p>Loading task submissions...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading submissions: {queryError.message}</p>
        <p className="text-sm text-muted-foreground mt-2">Please check console for details</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No task submissions found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Task submissions will appear here when users complete tasks
        </p>
      </div>
    );
  }

  const pendingCount = submissions?.filter(s => s.status === 'pending').length || 0;
  const approvedCount = submissions?.filter(s => s.status === 'approved').length || 0;
  const rejectedCount = submissions?.filter(s => s.status === 'rejected').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Submissions</h2>
          <p className="text-muted-foreground">
            Review and manage user task submissions
            {submissions?.length > 0 && ` (${submissions.length} total)`}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Submissions</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {submissions?.length === 0 ? 'No submissions found' : 'No submissions match your search'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-medium">{submission.tasks?.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {submission.tasks?.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{submission.user_profile?.name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{submission.user_profile?.email || 'No email'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.tasks?.points || 0} pts</TableCell>
                      <TableCell>
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateSubmissionStatus.mutate({ 
                                  id: submission.id, 
                                  status: 'approved' 
                                })}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateSubmissionStatus.mutate({ 
                                  id: submission.id, 
                                  status: 'rejected' 
                                })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedSubmission.tasks?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted by: {selectedSubmission.user_profile?.name || 'Unknown User'} ({selectedSubmission.user_profile?.email || 'No email'})
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Task Description</h4>
                <p className="text-sm">{selectedSubmission.tasks?.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Submission Evidence</h4>
                {selectedSubmission.evidence_url ? (
                  <div className="space-y-2">
                    {selectedSubmission.evidence_url.toLowerCase().includes('image') || 
                     selectedSubmission.evidence_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img 
                        src={selectedSubmission.evidence_url} 
                        alt="Evidence" 
                        className="max-w-full h-auto rounded border"
                      />
                    ) : (
                      <a 
                        href={selectedSubmission.evidence_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Evidence File
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No evidence provided</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Points</h4>
                  <p>{selectedSubmission.tasks?.points || 0} points</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setSelectedSubmission(null)} variant="outline" className="flex-1">
                  Close
                </Button>
                {selectedSubmission.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        updateSubmissionStatus.mutate({ 
                          id: selectedSubmission.id, 
                          status: 'approved' 
                        });
                        setSelectedSubmission(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        updateSubmissionStatus.mutate({ 
                          id: selectedSubmission.id, 
                          status: 'rejected' 
                        });
                        setSelectedSubmission(null);
                      }}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};