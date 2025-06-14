
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
  evidence: string | null;
  status: string;
  submitted_at: string;
  reviewed_at?: string | null;
  admin_notes?: string | null;
  calculated_points?: number;
  tasks: {
    id: string;
    title: string;
    points: number;
    category: string | null;
    difficulty: string | null;
  } | null;
  profiles: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export const enhancedTaskManagementService = {
  // Enhanced task analytics with fallback to direct queries
  async getTaskAnalytics(dateRange?: { start: Date; end: Date }): Promise<TaskAnalytics> {
    try {
      // Try edge function first, fallback to direct queries
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

        if (!error && data) return data;
      } catch (edgeFunctionError) {
        console.log('Edge function not available, using direct queries');
      }

      // Fallback to direct database queries
      const [tasksData, submissionsData] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('task_submissions').select('*')
      ]);

      const tasks = tasksData.data || [];
      const submissions = submissionsData.data || [];

      return {
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status === 'active').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
        approvalRate: submissions.length > 0 ? (submissions.filter(s => s.status === 'approved').length / submissions.length) * 100 : 0,
        avgCompletionTime: 0,
        topCategories: [],
        recentActivity: []
      };
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  },

  // Enhanced task search with fallback
  async searchTasks(filters: TaskFilters): Promise<any[]> {
    try {
      // Try edge function first
      try {
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: { 
            action: 'search_tasks_enhanced',
            data: filters
          }
        });

        if (!error && data) return data;
      } catch (edgeFunctionError) {
        console.log('Edge function not available, using direct queries');
      }

      // Fallback to direct query
      let query = supabase.from('tasks').select('*');
      
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      query = query.order(filters.sortBy || 'created_at', { 
        ascending: filters.sortOrder === 'asc' 
      });

      const { data, error } = await query;
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
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          points: taskData.points,
          category_id: taskData.category_id || null,
          difficulty: taskData.difficulty,
          brand_name: taskData.brand_name,
          brand_logo_url: taskData.brand_logo_url,
          estimated_time: taskData.estimated_time,
          expires_at: taskData.expires_at,
          status: taskData.status || 'active',
          task_type: taskData.task_type || 'general'
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
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  },

  // Enhanced submission processing with fallback
  async processTaskSubmission(
    submissionId: string, 
    status: 'approved' | 'rejected',
    feedback?: string,
    pointAdjustment?: number,
    qualityRating?: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .update({
          status,
          admin_notes: feedback,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
      
      toast.success(`Task submission ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error processing task submission:', error);
      toast.error(`Failed to ${status} submission`);
      return false;
    }
  },

  // Get pending submissions with fallback
  async getPendingSubmissions(filters?: {
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    submittedAfter?: Date;
    limit?: number;
  }): Promise<TaskSubmissionWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(id, title, points, category, difficulty),
          profiles(id, name, email)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(filters?.limit || 50);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: TaskSubmissionWithDetails[] = (data || []).map(submission => ({
        id: submission.id,
        task_id: submission.task_id,
        user_id: submission.user_id,
        evidence: submission.evidence,
        status: submission.status,
        submitted_at: submission.submitted_at,
        reviewed_at: submission.reviewed_at,
        admin_notes: submission.admin_notes,
        calculated_points: submission.calculated_points,
        tasks: submission.tasks,
        profiles: submission.profiles
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      return [];
    }
  },

  // Bulk task operations with fallback
  async performBulkTaskOperation(operation: BulkTaskOperation): Promise<boolean> {
    try {
      let updateData: any = {};
      
      switch (operation.operation) {
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'deactivate':
          updateData = { status: 'draft' };
          break;
        case 'update_points':
          updateData = { points: operation.data.points };
          break;
        case 'update_category':
          updateData = { category_id: operation.data.category_id };
          break;
        case 'delete':
          const { error: deleteError } = await supabase
            .from('tasks')
            .delete()
            .in('id', operation.taskIds);
          
          if (deleteError) throw deleteError;
          toast.success(`Deleted ${operation.taskIds.length} tasks`);
          return true;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .in('id', operation.taskIds);

        if (error) throw error;
      }
      
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
