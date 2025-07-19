
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export interface CreateCampaignPayload {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time?: string;
  expires_at?: string;
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fix the social_media_links type issue
    return (data || []).map(task => ({
      ...task,
      social_media_links: task.social_media_links as Record<string, string> | null
    }));
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
  },

  async createCampaign(campaignData: CreateCampaignPayload): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tasks')
      .insert({
        ...campaignData,
        brand_user_id: user.id,
        status: 'active',
        task_type: 'campaign',
        brand_name: 'Brand User'
      });

    if (error) throw error;
    toast.success('Campaign created successfully!');
  },

  async updateCampaign(taskId: string, campaignData: CreateCampaignPayload): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update(campaignData)
      .eq('id', taskId);

    if (error) throw error;
    toast.success('Campaign updated successfully!');
  },

  admin: {
    async getAllTasks(): Promise<Task[]> {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(task => ({
        ...task,
        social_media_links: task.social_media_links as Record<string, string> | null
      }));
    },

    async getAllSubmissions(): Promise<TaskSubmission[]> {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async createTask(taskData: any): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) {
          console.error('Task creation error:', error);
          toast.error('Failed to create task: ' + error.message);
          return false;
        }

        toast.success('Task created successfully!');
        return true;
      } catch (error: any) {
        console.error('Task creation error:', error);
        toast.error('Failed to create task');
        return false;
      }
    },

    async deleteTask(taskId: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) {
          console.error('Task deletion error:', error);
          toast.error('Failed to delete task');
          return false;
        }

        return true;
      } catch (error: any) {
        console.error('Task deletion error:', error);
        toast.error('Failed to delete task');
        return false;
      }
    },

    async updateSubmissionStatus(
      submissionId: string, 
      status: 'approved' | 'rejected', 
      notes?: string
    ): Promise<void> {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
    }
  }
};
