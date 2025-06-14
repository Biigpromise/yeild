
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
  recentActivity: Array<{
    date: string;
    submissions: number;
    approvals: number;
  }>;
}

export interface BulkTaskOperation {
  taskIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update_points' | 'update_category';
  data?: any;
}

export interface TaskFilters {
  status?: string;
  category?: string;
  difficulty?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  pointsRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
  sortBy?: 'created_at' | 'title' | 'points' | 'submissions';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskSubmissionWithDetails {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  calculated_points?: number;
  tasks: {
    id: string;
    title: string;
    points: number;
    category: string;
    difficulty: string;
  };
  profiles: {
    id: string;
    name: string;
    email: string;
  };
}

export const enhancedTaskManagementService = {
  // Enhanced task analytics
  async getTaskAnalytics(dateRange?: { start: Date; end: Date }): Promise<TaskAnalytics> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'get_enhanced_task_analytics',
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

  // Enhanced task search and filtering
  async searchTasks(filters: TaskFilters): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'search_tasks_enhanced',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching tasks:', error);
      toast.error('Failed to search tasks');
      return [];
    }
  },

  // Create task with enhanced validation
  async createTask(taskData: any): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'create_task_enhanced',
          data: {
            ...taskData,
            created_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success('Task created successfully');
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return false;
    }
  },

  // Update task
  async updateTask(taskId: string, updates: any): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'update_task_enhanced',
          data: { 
            taskId, 
            updates: {
              ...updates,
              updated_at: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success('Task updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  },

  // Enhanced submission processing with detailed feedback
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
          action: 'process_task_submission_enhanced',
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

  // Get pending submissions with enhanced filtering
  async getPendingSubmissions(filters?: {
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    submittedAfter?: Date;
    limit?: number;
  }): Promise<TaskSubmissionWithDetails[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'get_pending_submissions_enhanced',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      return [];
    }
  },

  // Bulk task operations
  async performBulkTaskOperation(operation: BulkTaskOperation): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'bulk_task_operation_enhanced',
          data: operation
        }
      });

      if (error) throw error;
      
      toast.success(`Bulk ${operation.operation} completed for ${operation.taskIds.length} tasks`);
      return true;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
      return false;
    }
  },

  // Task category management
  async getTaskCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async createTaskCategory(categoryData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_categories')
        .insert(categoryData);

      if (error) throw error;
      
      toast.success('Category created successfully');
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      return false;
    }
  },

  async updateTaskCategory(categoryId: string, updates: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Category updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      return false;
    }
  },

  async deleteTaskCategory(categoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Category deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      return false;
    }
  }
};
