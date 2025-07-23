
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { DuplicateImageManager } from './DuplicateImageManager';
import { toast } from "sonner";
import { TaskSubmissionReview } from "./TaskSubmissionReview";
import { TaskAnalytics } from "./TaskAnalytics";

interface TaskStats {
  pendingApproval: number;
  activeTasks: number;
  approved: number;
  rejected: number;
  total: number;
}

interface Submission {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  submission_text: string;
  image_url?: string;
  submitted_at: string;
  admin_notes?: string;
  tasks: {
    title: string;
    points: number;
    category: string;
    difficulty: string;
  };
  profiles: {
    name: string;
    email: string;
  };
}

export const AdminTaskOverview = () => {
  const [stats, setStats] = useState<TaskStats>({ 
    pendingApproval: 0, 
    activeTasks: 0, 
    approved: 0, 
    rejected: 0, 
    total: 0 
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadTaskStats();
    loadSubmissions();
  }, []);

  const loadTaskStats = async () => {
    try {
      setLoading(true);
      
      // Get pending approvals count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error loading pending submissions:', pendingError);
        toast.error('Failed to load pending submissions');
      }

      // Get active tasks count
      const { count: activeCount, error: activeError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) {
        console.error('Error loading active tasks:', activeError);
        toast.error('Failed to load active tasks');
      }

      // Get approved submissions count
      const { count: approvedCount, error: approvedError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (approvedError) {
        console.error('Error loading approved submissions:', approvedError);
      }

      // Get rejected submissions count
      const { count: rejectedCount, error: rejectedError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      if (rejectedError) {
        console.error('Error loading rejected submissions:', rejectedError);
      }

      // Get total submissions count
      const { count: totalCount, error: totalError } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error loading total submissions:', totalError);
      }

      setStats({
        pendingApproval: pendingCount || 0,
        activeTasks: activeCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
        total: totalCount || 0
      });
    } catch (error) {
      console.error('Error loading task stats:', error);
      toast.error('Failed to load task statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(title, points, category, difficulty),
          profiles(name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading submissions:', error);
        toast.error('Failed to load submissions');
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    }
  };

  const handleApprovePending = () => {
    setActiveTab("pending");
  };

  const handleCreateTask = () => {
    // Navigate to create task - this could be a modal or redirect
    window.dispatchEvent(new CustomEvent('navigateToCreateTask'));
  };

  const handleUpdateSubmission = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success(`Submission ${status} successfully`);
      loadTaskStats();
      loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
              <div className="text-sm text-muted-foreground">Pending Approval</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold">{stats.activeTasks}</div>
              <div className="text-sm text-muted-foreground">Active Tasks</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              disabled={stats.pendingApproval === 0}
              onClick={handleApprovePending}
            >
              Approve Pending ({stats.pendingApproval})
            </Button>
            <Button className="flex-1" onClick={handleCreateTask}>
              Create New Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review ({stats.pendingApproval})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicate Images</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center">{stats.total}</div>
                <div className="text-sm text-muted-foreground text-center">Total Submissions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center text-orange-600">{stats.pendingApproval}</div>
                <div className="text-sm text-muted-foreground text-center">Pending Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center text-green-600">{stats.approved}</div>
                <div className="text-sm text-muted-foreground text-center">Approved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center text-red-600">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground text-center">Rejected</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <TaskSubmissionReview 
            submissions={pendingSubmissions}
            onUpdate={handleUpdateSubmission}
          />
        </TabsContent>

        <TabsContent value="approved">
          <TaskSubmissionReview 
            submissions={approvedSubmissions}
            onUpdate={handleUpdateSubmission}
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <TaskSubmissionReview 
            submissions={rejectedSubmissions}
            onUpdate={handleUpdateSubmission}
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <TaskAnalytics />
        </TabsContent>

        <TabsContent value="duplicates">
          <DuplicateImageManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
