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
  // Enhanced task analytics with real data
  async getTaskAnalytics(dateRange?: { start: Date; end: Date }): Promise<TaskAnalytics> {
    try {
      const [tasksData, submissionsData] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('task_submissions').select('*')
      ]);

      const tasks = tasksData.data || [];
      const submissions = submissionsData.data || [];

      // Calculate category counts
      const categoryMap = new Map<string, number>();
      tasks.forEach(task => {
        const category = task.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate recent activity (last 7 days)
      const recentActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySubmissions = submissions.filter(s => 
          s.submitted_at?.startsWith(dateStr)
        ).length;
        
        const dayApprovals = submissions.filter(s => 
          s.reviewed_at?.startsWith(dateStr) && s.status === 'approved'
        ).length;

        recentActivity.push({
          date: dateStr,
          submissions: daySubmissions,
          approvals: dayApprovals
        });
      }

      return {
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status === 'active').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
        approvalRate: submissions.length > 0 ? (submissions.filter(s => s.status === 'approved').length / submissions.length) * 100 : 0,
        avgCompletionTime: 0,
        topCategories,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  },

  // Enhanced task search with real data
  async searchTasks(filters: TaskFilters): Promise<any[]> {
    try {
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

      if (filters.pointsRange) {
        query = query.gte('points', filters.pointsRange.min);
        if (filters.pointsRange.max) {
          query = query.lte('points', filters.pointsRange.max);
        }
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
      console.log('Creating task with enhanced service:', taskData);
      
      // Prepare the data for insertion with proper null handling
      const insertData = {
        title: taskData.title,
        description: taskData.description,
        points: taskData.points,
        status: taskData.status || 'active',
        task_type: taskData.task_type || 'general',
        // Handle optional fields properly
        ...(taskData.category_id && { category_id: taskData.category_id }),
        ...(taskData.difficulty && { difficulty: taskData.difficulty }),
        ...(taskData.brand_name && { brand_name: taskData.brand_name }),
        ...(taskData.brand_logo_url && { brand_logo_url: taskData.brand_logo_url }),
        ...(taskData.estimated_time && { estimated_time: taskData.estimated_time }),
        ...(taskData.expires_at && { expires_at: taskData.expires_at }),
        ...(taskData.social_media_links && { social_media_links: taskData.social_media_links }),
      };

      console.log('Inserting task data:', insertData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      toast.success('Task created successfully');
      return true;
    } catch (error: any) {
      console.error('Error creating task:', error);
      
      // Provide specific error messages
      if (error.code === '42501') {
        toast.error('Permission denied. Admin access required.');
      } else if (error.code === '23505') {
        toast.error('A task with this information already exists.');
      } else {
        toast.error(`Failed to create task: ${error.message || 'Unknown error'}`);
      }
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
          category_id: updates.category_id ? updates.category_id : null,
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

  // Get all tasks with better error handling
  async getTasks(): Promise<any[]> {
    try {
      console.log('Fetching tasks from enhanced service...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching tasks:', error);
        throw error;
      }
      
      console.log('Tasks fetched successfully:', data?.length || 0, 'tasks');
      return data || [];
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      
      // Don't show error toast for tasks since it's handled at component level
      return [];
    }
  },

  // Get all submissions with better error handling
  async getAllSubmissions(): Promise<any[]> {
    try {
      console.log('Fetching submissions from enhanced service...');
      
      // First get submissions without joins to avoid relation errors
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        return [];
      }

      if (!submissions || submissions.length === 0) {
        console.log('No submissions found');
        return [];
      }

      // Get related task data separately
      const taskIds = [...new Set(submissions.map(sub => sub.task_id).filter(Boolean))];
      const userIds = [...new Set(submissions.map(sub => sub.user_id).filter(Boolean))];

      const [tasksResult, profilesResult] = await Promise.all([
        taskIds.length > 0 ? supabase
          .from('tasks')
          .select('id, title, points, category, difficulty')
          .in('id', taskIds) : Promise.resolve({ data: [], error: null }),
        userIds.length > 0 ? supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds) : Promise.resolve({ data: [], error: null })
      ]);

      const tasks = tasksResult.data || [];
      const profiles = profilesResult.data || [];

      // Combine the data
      const submissionsWithDetails = submissions.map(submission => ({
        ...submission,
        tasks: tasks.find(task => task.id === submission.task_id) || null,
        profiles: profiles.find(profile => profile.id === submission.user_id) || null
      }));

      console.log('Submissions fetched successfully:', submissionsWithDetails.length, 'submissions');
      return submissionsWithDetails;
    } catch (error: any) {
      console.error('Error fetching all submissions:', error);
      return [];
    }
  },

  // Delete a single task
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  // Enhanced submission processing
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

  // Get pending submissions with proper error handling
  async getPendingSubmissions(filters?: {
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    submittedAfter?: Date;
    limit?: number;
  }): Promise<TaskSubmissionWithDetails[]> {
    try {
      // Use a single query with proper joins
      const { data: submissionsWithDetails, error } = await supabase
        .from('task_submissions')
        .select(`
          id,
          task_id,
          user_id,
          evidence,
          status,
          submitted_at,
          reviewed_at,
          admin_notes,
          calculated_points,
          tasks:tasks!inner (
            id,
            title,
            points,
            category,
            difficulty
          ),
          profiles:profiles!inner (
            id,
            name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(filters?.limit || 50);

      if (error) {
        console.error('Error fetching submissions with details:', error);
        return [];
      }

      if (!submissionsWithDetails || submissionsWithDetails.length === 0) {
        return [];
      }

      // Transform the data with explicit type checking
      const transformedData: TaskSubmissionWithDetails[] = [];
      
      for (const submission of submissionsWithDetails) {
        // Explicit null checks for each submission
        if (!submission.tasks || !submission.profiles) {
          console.warn('Skipping submission with missing data:', submission.id);
          continue;
        }

        // Handle array vs object response from Supabase joins
        const taskData = Array.isArray(submission.tasks) ? submission.tasks[0] : submission.tasks;
        const profileData = Array.isArray(submission.profiles) ? submission.profiles[0] : submission.profiles;
        
        // Additional safety checks
        if (!taskData || !profileData) {
          console.warn('Skipping submission with invalid join data:', submission.id);
          continue;
        }

        transformedData.push({
          id: submission.id,
          task_id: submission.task_id,
          user_id: submission.user_id,
          evidence: submission.evidence,
          status: submission.status,
          submitted_at: submission.submitted_at,
          reviewed_at: submission.reviewed_at,
          admin_notes: submission.admin_notes,
          calculated_points: submission.calculated_points,
          tasks: taskData,
          profiles: profileData
        });
      }

      return transformedData;
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      return [];
    }
  },

  // Bulk task operations
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
      console.log('Fetching task categories from enhanced service...');
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Database error fetching categories:', error);
        // Don't throw error for categories since they're optional
        return [];
      }
      
      console.log('Categories fetched successfully:', data?.length || 0, 'categories');
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async createTaskCategory(categoryData: any): Promise<boolean> {
    try {
      console.log('Creating task category with data:', categoryData);
      
      const { data, error } = await supabase
        .from('task_categories')
        .insert([categoryData])
        .select();

      if (error) {
        console.error('Database error creating category:', error);
        throw error;
      }
      
      console.log('Category created successfully:', data);
      toast.success('Category created successfully');
      return true;
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Check for specific error types
      if (error.code === '42501') {
        toast.error('Permission denied. Only admins can create categories.');
      } else if (error.code === '23505') {
        toast.error('A category with this name already exists.');
      } else {
        toast.error(`Failed to create category: ${error.message || 'Unknown error'}`);
      }
      return false;
    }
  },

  async updateTaskCategory(categoryId: string, updates: any): Promise<boolean> {
    try {
      console.log('Updating task category:', categoryId, 'with data:', updates);
      
      const { data, error } = await supabase
        .from('task_categories')
        .update(updates)
        .eq('id', categoryId)
        .select();

      if (error) {
        console.error('Database error updating category:', error);
        throw error;
      }
      
      console.log('Category updated successfully:', data);
      toast.success('Category updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(`Failed to update category: ${error.message || 'Unknown error'}`);
      return false;
    }
  },

  async deleteTaskCategory(categoryId: string): Promise<boolean> {
    try {
      console.log('Deleting task category:', categoryId);
      
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Database error deleting category:', error);
        throw error;
      }
      
      console.log('Category deleted successfully');
      toast.success('Category deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Failed to delete category: ${error.message || 'Unknown error'}`);
      return false;
    }
  }
};
