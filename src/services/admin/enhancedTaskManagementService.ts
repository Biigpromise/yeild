
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
        .select(`
          *,
          task_categories(name, description)
        `)
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
        throw error;
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
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createTask:', error);
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
        throw error;
      }

      console.log('Task updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateTask:', error);
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
        throw error;
      }

      console.log('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return false;
    }
  },

  // Get all task submissions
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
        throw error;
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
        throw error;
      }

      console.log('Submission updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateSubmissionStatus:', error);
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
        throw error;
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
        throw error;
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
      
      // Handle delete operation separately
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

      // Handle other operations
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
      
      // Get basic task counts
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status, created_at, category_id, task_categories(name)');

      if (tasksError) {
        console.error('Error fetching tasks for analytics:', tasksError);
        throw tasksError;
      }

      // Get submissions data for the date range
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('id, status, submitted_at, reviewed_at')
        .gte('submitted_at', params.start.toISOString())
        .lte('submitted_at', params.end.toISOString());

      if (submissionsError) {
        console.error('Error fetching submissions for analytics:', submissionsError);
        throw submissionsError;
      }

      const totalTasks = tasksData?.length || 0;
      const activeTasks = tasksData?.filter(t => t.status === 'active').length || 0;
      const pendingSubmissions = submissionsData?.filter(s => s.status === 'pending').length || 0;
      const completedTasks = submissionsData?.filter(s => s.status === 'approved').length || 0;
      const approvalRate = submissionsData?.length > 0 
        ? Math.round((completedTasks / submissionsData.length) * 100) 
        : 0;

      // Get recent activity data from the last 7 days
      const recentActivityPromises = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        recentActivityPromises.push(
          supabase
            .from('task_submissions')
            .select('status')
            .gte('submitted_at', `${dateStr} 00:00:00`)
            .lt('submitted_at', `${dateStr} 23:59:59`)
            .then(({ data }) => ({
              date: dateStr,
              submissions: data?.length || 0,
              approvals: data?.filter(s => s.status === 'approved').length || 0
            }))
        );
      }

      const recentActivity = await Promise.all(recentActivityPromises);

      // Calculate top categories from tasks
      const categoryCount: { [key: string]: number } = {};
      tasksData?.forEach(task => {
        const categoryName = task.task_categories?.name || 'Uncategorized';
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate average completion time
      const completedSubmissions = submissionsData?.filter(s => s.status === 'approved' && s.reviewed_at) || [];
      let avgCompletionTime = 24; // default 24 hours
      
      if (completedSubmissions.length > 0) {
        const totalCompletionTime = completedSubmissions.reduce((acc, submission) => {
          const submitted = new Date(submission.submitted_at);
          const reviewed = new Date(submission.reviewed_at);
          const diffHours = Math.abs(reviewed.getTime() - submitted.getTime()) / (1000 * 60 * 60);
          return acc + diffHours;
        }, 0);
        avgCompletionTime = Math.round(totalCompletionTime / completedSubmissions.length);
      }

      const analytics: TaskAnalytics = {
        totalTasks,
        activeTasks,
        pendingSubmissions,
        completedTasks,
        approvalRate,
        avgCompletionTime,
        recentActivity,
        topCategories
      };

      console.log('Analytics calculated:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error in getTaskAnalytics:', error);
      throw error;
    }
  }
};
