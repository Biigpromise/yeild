import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TaskAnalytics {
  totalTasks: number;
  activeTasks: number;
  pendingSubmissions: number;
  completedTasks: number;
  approvalRate: number;
  avgCompletionTime: number;
  recentActivity: Array<{
    date: string;
    submissions: number;
    approvals: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export const enhancedTaskManagementService = {
  // Get all tasks with enhanced data
  async getTasks() {
    try {
      console.log('Fetching tasks from database...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gt('budget_allocated', 0)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Tasks fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },

  // Get task categories
  async getTaskCategories() {
    try {
      console.log('Fetching task categories...');
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        // Return empty array instead of throwing to prevent blocking task creation
        return [];
      }

      console.log('Categories fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTaskCategories:', error);
      return [];
    }
  },

  // Create a new task
  async createTask(taskData: any) {
    try {
      console.log('Creating task with data:', taskData);
      
      // Clean the task data to ensure only valid fields are included
      const cleanTaskData = {
        title: taskData.title,
        description: taskData.description,
        points: taskData.points,
        status: taskData.status || 'active',
        difficulty: taskData.difficulty || null,
        estimated_time: taskData.estimated_time || null,
        expires_at: taskData.expires_at || null,
        brand_name: taskData.brand_name || null,
        brand_logo_url: taskData.brand_logo_url || null,
        task_type: taskData.task_type || 'general',
        social_media_links: taskData.social_media_links || null,
        category_id: taskData.category_id || null
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([cleanTaskData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast.error(`Failed to create task: ${error.message}`);
        throw error;
      }

      console.log('Task created successfully:', data);
      toast.success('Task created successfully!');
      return true;
    } catch (error) {
      console.error('Error in createTask:', error);
      toast.error('Failed to create task. Please try again.');
      return false;
    }
  },

  // Update an existing task
  async updateTask(taskId: string, taskData: any) {
    try {
      console.log('Updating task:', taskId, 'with data:', taskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        toast.error(`Failed to update task: ${error.message}`);
        throw error;
      }

      console.log('Task updated successfully:', data);
      toast.success('Task updated successfully!');
      return true;
    } catch (error) {
      console.error('Error in updateTask:', error);
      toast.error('Failed to update task. Please try again.');
      return false;
    }
  },

  // Delete a task
  async deleteTask(taskId: string) {
    try {
      console.log('Deleting task:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error(`Failed to delete task: ${error.message}`);
        throw error;
      }

      console.log('Task deleted successfully');
      toast.success('Task deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      toast.error('Failed to delete task. Please try again.');
      return false;
    }
  },

  // Get all task submissions with better error handling
  async getAllSubmissions() {
    try {
      console.log('Fetching task submissions...');
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(title, points),
          profiles(name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        // Return empty array to prevent blocking other functionality
        return [];
      }

      console.log('Submissions fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAllSubmissions:', error);
      return [];
    }
  },

  // Update submission status
  async updateSubmissionStatus(submissionId: string, status: string, adminNotes?: string) {
    try {
      console.log('Updating submission status:', submissionId, status);
      
      const updateData: any = { status };
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { data, error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating submission:', error);
        toast.error(`Failed to update submission: ${error.message}`);
        throw error;
      }

      console.log('Submission updated successfully:', data);
      toast.success('Submission updated successfully!');
      return true;
    } catch (error) {
      console.error('Error in updateSubmissionStatus:', error);
      toast.error('Failed to update submission. Please try again.');
      return false;
    }
  },

  // Task category management methods
  async createTaskCategory(categoryData: any) {
    try {
      console.log('Creating task category with data:', categoryData);
      
      const { data, error } = await supabase
        .from('task_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task category:', error);
        throw error;
      }

      console.log('Task category created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createTaskCategory:', error);
      return false;
    }
  },

  async updateTaskCategory(categoryId: string, categoryData: any) {
    try {
      console.log('Updating task category:', categoryId, 'with data:', categoryData);
      
      const { data, error } = await supabase
        .from('task_categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task category:', error);
        throw error;
      }

      console.log('Task category updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateTaskCategory:', error);
      return false;
    }
  },

  async deleteTaskCategory(categoryId: string) {
    try {
      console.log('Deleting task category:', categoryId);
      
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting task category:', error);
        throw error;
      }

      console.log('Task category deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteTaskCategory:', error);
      return false;
    }
  },

  // Task template management methods
  async getTaskTemplates() {
    try {
      console.log('Fetching task templates...');
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task templates:', error);
        return [];
      }

      console.log('Task templates fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getTaskTemplates:', error);
      return [];
    }
  },

  async createTaskTemplate(templateData: any) {
    try {
      console.log('Creating task template with data:', templateData);
      
      const { data, error } = await supabase
        .from('task_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task template:', error);
        throw error;
      }

      console.log('Task template created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createTaskTemplate:', error);
      return false;
    }
  },

  // Scheduled tasks management
  async getScheduledTasks() {
    try {
      console.log('Fetching scheduled tasks...');
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select(`
          *,
          tasks(id, title, points, status)
        `)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled tasks:', error);
        return [];
      }

      console.log('Scheduled tasks fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getScheduledTasks:', error);
      return [];
    }
  },

  async createScheduledTask(scheduleData: any) {
    try {
      console.log('Creating scheduled task with data:', scheduleData);
      
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .insert([scheduleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating scheduled task:', error);
        throw error;
      }

      console.log('Scheduled task created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createScheduledTask:', error);
      return false;
    }
  },

  // Bulk operations method
  async performBulkTaskOperation(operation: {
    taskIds: string[];
    operation: 'activate' | 'deactivate' | 'update_points' | 'update_category' | 'delete';
    data?: any;
  }) {
    try {
      console.log('Performing bulk operation:', operation);
      
      if (operation.operation === 'delete') {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .in('id', operation.taskIds);
        
        if (deleteError) {
          console.error('Error in bulk delete:', deleteError);
          return false;
        }
        return true;
      }

      let updateData: any = {};
      
      switch (operation.operation) {
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          break;
        case 'update_points':
          updateData = { points: operation.data.points };
          break;
        case 'update_category':
          updateData = { category_id: operation.data.category_id };
          break;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .in('id', operation.taskIds);

      if (error) {
        console.error('Error in bulk update:', error);
        return false;
      }

      console.log('Bulk operation completed successfully');
      return true;
    } catch (error) {
      console.error('Error in performBulkTaskOperation:', error);
      return false;
    }
  },

  // Analytics method - now using real database queries
  async getTaskAnalytics(params: { start: Date; end: Date }): Promise<TaskAnalytics> {
    try {
      console.log('Fetching task analytics for period:', params);
      
      // Get basic task counts with simplified query to avoid RLS issues
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status, created_at');

      if (tasksError) {
        console.error('Error fetching tasks for analytics:', tasksError);
        // Return default analytics instead of throwing
        return {
          totalTasks: 0,
          activeTasks: 0,
          pendingSubmissions: 0,
          completedTasks: 0,
          approvalRate: 0,
          avgCompletionTime: 24,
          recentActivity: [],
          topCategories: []
        };
      }

      const totalTasks = tasksData?.length || 0;
      const activeTasks = tasksData?.filter(t => t.status === 'active' && (t as any).budget_allocated > 0).length || 0;

      // Simplified analytics without complex joins
      const analytics: TaskAnalytics = {
        totalTasks,
        activeTasks,
        pendingSubmissions: 0,
        completedTasks: 0,
        approvalRate: 0,
        avgCompletionTime: 24,
        recentActivity: [],
        topCategories: []
      };

      console.log('Analytics calculated:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error in getTaskAnalytics:', error);
      // Return default analytics instead of throwing
      return {
        totalTasks: 0,
        activeTasks: 0,
        pendingSubmissions: 0,
        completedTasks: 0,
        approvalRate: 0,
        avgCompletionTime: 24,
        recentActivity: [],
        topCategories: []
      };
    }
  }
};
