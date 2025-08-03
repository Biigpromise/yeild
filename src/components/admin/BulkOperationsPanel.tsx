
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { automatedTaskProcessingService } from "@/services/admin/automatedTaskProcessingService";
import { toast } from "sonner";
import { CheckSquare, XCircle, Users, Filter, Eye } from "lucide-react";

export const BulkOperationsPanel = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [qualityScore, setQualityScore] = useState(80);

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!task_submissions_task_id_fkey(title, points, task_type, category),
          profiles!task_submissions_user_id_fkey(name, email)
        `)
        .eq('status', filterStatus)
        .order('submitted_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading submissions:', error);
        toast.error('Failed to load submissions');
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(submissions.map(s => s.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(prev => [...prev, submissionId]);
    } else {
      setSelectedSubmissions(prev => prev.filter(id => id !== submissionId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedSubmissions.length === 0) {
      toast.error('Please select submissions to approve');
      return;
    }

    setBulkProcessing(true);
    try {
      const success = await automatedTaskProcessingService.bulkApprove(selectedSubmissions, qualityScore);
      
      if (success) {
        toast.success(`Successfully approved ${selectedSubmissions.length} submissions`);
        setSelectedSubmissions([]);
        await loadSubmissions();
      } else {
        toast.error('Failed to approve some submissions');
      }
    } catch (error) {
      console.error('Error in bulk approval:', error);
      toast.error('Failed to process bulk approval');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedSubmissions.length === 0) {
      toast.error('Please select submissions to reject');
      return;
    }

    setBulkProcessing(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'rejected',
          admin_notes: 'Bulk rejected by admin',
          reviewed_at: new Date().toISOString()
        })
        .in('id', selectedSubmissions);

      if (error) {
        console.error('Error rejecting submissions:', error);
        toast.error('Failed to reject submissions');
        return;
      }

      toast.success(`Successfully rejected ${selectedSubmissions.length} submissions`);
      setSelectedSubmissions([]);
      await loadSubmissions();
    } catch (error) {
      console.error('Error in bulk rejection:', error);
      toast.error('Failed to process bulk rejection');
    } finally {
      setBulkProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'social_media': return 'bg-blue-100 text-blue-800';
      case 'app_testing': return 'bg-purple-100 text-purple-800';
      case 'survey': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quality-score">Quality Score</Label>
              <Input
                id="quality-score"
                type="number"
                min="0"
                max="100"
                value={qualityScore}
                onChange={(e) => setQualityScore(Number(e.target.value))}
                className="w-24"
              />
            </div>
            
            <Button variant="outline" onClick={loadSubmissions}>
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedSubmissions.length} of {submissions.length} selected
            </span>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleBulkApprove}
              disabled={selectedSubmissions.length === 0 || bulkProcessing}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Approve Selected
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleBulkReject}
              disabled={selectedSubmissions.length === 0 || bulkProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Submissions ({submissions.length})</span>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found for the selected status
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                     <Checkbox
                       checked={selectedSubmissions.includes(submission.id)}
                       onCheckedChange={(checked) => handleSelectSubmission(submission.id, !!checked)}
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{submission.tasks.title}</span>
                          <Badge className={getTaskTypeColor(submission.tasks.task_type)}>
                            {submission.tasks.task_type}
                          </Badge>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-600">{submission.tasks.points} pts</span>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>User: {submission.profiles.name} ({submission.profiles.email})</div>
                        <div>Submitted: {new Date(submission.submitted_at).toLocaleString()}</div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-medium mb-1">Evidence:</div>
                        <div className="bg-gray-50 p-2 rounded text-xs line-clamp-2">
                          {submission.evidence}
                        </div>
                      </div>
                      
                      {submission.evidence_file_url && (
                        <div className="text-sm">
                          <Badge variant="outline">Has Evidence File</Badge>
                        </div>
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
