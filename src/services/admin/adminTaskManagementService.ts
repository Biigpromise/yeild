
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TaskAnalytics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingSubmissions: number;
  approvalRate: number;
  avgCompletionTime: number;
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: any[];
}

export interface BulkTaskOperation {
  taskIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update_points' | 'update_category';
  data?: any;
}

export const adminTaskManagementService = {
  // Enhanced task approval/rejection with detailed feedback
  async processTaskSubmission(
    submissionId: string, 
    status: 'approved' | 'rejected',
    feedback?: string,
    pointAdjustment?: number,
    qualityRating?: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'process_task_submission',
          data: { 
            submissionId, 
            status, 
            feedback, 
            pointAdjustment,
            qualityRating,
            processedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success(`Task submission ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error processing task submission:', error);
      toast.error(`Failed to ${status} submission`);
      return false;
    }
  },

  // Bulk task operations
  async performBulkTaskOperation(operation: BulkTaskOperation): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'bulk_task_operation',
          data: operation
        }
      });

      if (error) throw error;
      
      // The service shouldn't toast, the component should.
      // toast.success(`Bulk ${operation.operation} completed for ${operation.taskIds.length} tasks`);
      return data.success;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
      return false;
    }
  },

  // Get task analytics and performance metrics
  async getTaskAnalytics(dateRange?: { start: Date; end: Date }): Promise<TaskAnalytics> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'get_task_analytics',
          data: { 
            startDate: dateRange?.start?.toISOString(),
            endDate: dateRange?.end?.toISOString()
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  },

  // Get pending submissions with enhanced filtering
  async getPendingSubmissions(filters?: {
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    submittedAfter?: Date;
  }): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'get_pending_submissions',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      return [];
    }
  }
};
