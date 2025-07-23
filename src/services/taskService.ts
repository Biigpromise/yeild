
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  submission_text: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

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
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async getTaskById(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }
};
