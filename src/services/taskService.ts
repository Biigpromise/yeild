
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  estimated_time: string;
  difficulty: string;
  task_type: string;
  brand_name: string;
  brand_logo_url?: string;
  status: string;
  created_at: string;
  expires_at?: string;
  social_media_links?: Record<string, string> | null;
  brand_user_id?: string;
  category_id?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCategories(): Promise<TaskCategory[]> {
    const { data, error } = await supabase
      .from('task_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getUserSubmissions(): Promise<TaskSubmission[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_tasks')
      .select(`
        *,
        tasks (
          title,
          points
        )
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async submitTask(taskId: string, evidence: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('task_submissions')
      .insert({
        task_id: taskId,
        user_id: user.id,
        evidence,
        status: 'pending'
      });

    if (error) throw error;
  }
};
