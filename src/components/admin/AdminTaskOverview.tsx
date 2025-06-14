
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { taskService } from "@/services/taskService";

interface TaskStats {
  pendingApproval: number;
  activeTasks: number;
}

export const AdminTaskOverview = () => {
  const [stats, setStats] = useState<TaskStats>({ pendingApproval: 0, activeTasks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskStats();
  }, []);

  const loadTaskStats = async () => {
    try {
      setLoading(true);
      
      // Get pending approvals
      const { data: pendingSubmissions, error: pendingError } = await supabase
        .from('task_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get active tasks
      const { data: activeTasks, error: activeError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      setStats({
        pendingApproval: pendingSubmissions?.count || 0,
        activeTasks: activeTasks?.count || 0
      });
    } catch (error) {
      console.error('Error loading task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePending = () => {
    // Navigate to submissions tab - this would be handled by parent component
    window.dispatchEvent(new CustomEvent('navigateToSubmissions'));
  };

  const handleCreateTask = () => {
    // Navigate to create task tab - this would be handled by parent component
    window.dispatchEvent(new CustomEvent('navigateToCreateTask'));
  };

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
            Approve Pending
          </Button>
          <Button className="flex-1" onClick={handleCreateTask}>
            Create New Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
