
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, TaskCategory, TaskSubmission } from '@/services/types/taskTypes';

// Re-export types for convenience
export type { Task, TaskCategory, TaskSubmission } from '@/services/types/taskTypes';

export const taskService = {
  async submitTask(taskId: string, submissionText: string, imageUrl?: string) {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          submission_text: submissionText,
          image_url: imageUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Task submitted successfully! Please wait for admin approval.');
      return data;
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
      throw error;
    }
  },

  async getUserTasks() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('user_tasks')
        .select(`
          *,
          tasks (
            id,
            title,
            description,
            points,
            category,
            difficulty,
            brand_name,
            estimated_time
          )
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  },

  async getUserSubmissions() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!fk_task_submissions_task_id (
            id,
            title,
            description,
            points,
            category,
            difficulty,
            brand_name,
            estimated_time
          )
        `)
        .eq('user_id', user.user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  },

  async getAllTasks() {
    try {
      console.log('Fetching all tasks with social media links...');
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedTasks = (data || []).map(task => ({
        ...task,
        social_media_links: this.transformSocialMediaLinks(task.social_media_links),
        category: task.task_categories?.name || task.category || 'General'
      }));
      
      console.log('Tasks loaded with social links:', transformedTasks);
      return transformedTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  transformSocialMediaLinks(links: any): Record<string, string> | null {
    if (!links) return null;
    if (typeof links === 'string') {
      try {
        return JSON.parse(links);
      } catch {
        return null;
      }
    }
    if (typeof links === 'object') {
      return links as Record<string, string>;
    }
    return null;
  },

  async getTaskById(taskId: string) {
    try {
      console.log('Fetching task by ID with social links:', taskId);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            name
          )
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;
      
      const transformedTask = {
        ...data,
        social_media_links: this.transformSocialMediaLinks(data.social_media_links),
        category: data.task_categories?.name || data.category || 'General'
      };
      
      console.log('Task loaded with social links:', transformedTask);
      return transformedTask;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  async getTasks() {
    return this.getAllTasks();
  },

  async getCategories() {
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

  admin: {
    async getAllTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching admin tasks:', error);
        return [];
      }
    },

    async getAllSubmissions() {
      try {
        const { data, error } = await supabase
          .from('task_submissions')
          .select(`
            *,
            tasks (
              id,
              title,
              description,
              points,
              category,
              difficulty,
              brand_name
            ),
            profiles (
              display_name,
              avatar_url
            )
          `)
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching admin submissions:', error);
        return [];
      }
    },

    async createTask(taskData: any) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) throw error;
        toast.success('Task created successfully');
        return data;
      } catch (error) {
        console.error('Error creating task:', error);
        toast.error('Failed to create task');
        throw error;
      }
    },

    async deleteTask(taskId: string) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting task:', error);
        return false;
      }
    },

    async updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected', notes?: string) {
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
        return true;
      } catch (error) {
        console.error('Error updating submission status:', error);
        throw error;
      }
    }
  }
};
