
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
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
  // Get all active tasks
  async getTasks(): Promise<Task[]> {
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
      toast.error('Failed to load tasks');
      return [];
    }
  },

  // Get task categories
  async getCategories(): Promise<TaskCategory[]> {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      return [];
    }
  },

  // Get user's task submissions
  async getUserSubmissions(): Promise<TaskSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(title, points, category),
          profiles(name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      return [];
    }
  },

  // Get user's completed tasks
  async getUserTasks(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select(`
          *,
          tasks(title, points, category, brand_name)
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      toast.error('Failed to load user tasks');
      return [];
    }
  },

  // Submit a task
  async submitTask(taskId: string, evidence: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          evidence,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Task submitted successfully!');
      return true;
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
      return false;
    }
  },

  // Admin functions
  admin: {
    async getAllTasks(): Promise<Task[]> {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching all tasks:', error);
        return [];
      }
    },

    async getAllSubmissions(): Promise<any[]> {
      try {
        const { data, error } = await supabase
          .from('task_submissions')
          .select(`
            *,
            tasks(title, points, category),
            profiles(name, email)
          `)
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching all submissions:', error);
        return [];
      }
    },

    async createTask(taskData: any): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },

    async updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected', notes?: string): Promise<boolean> {
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
        console.error('Error updating submission:', error);
        return false;
      }
    },

    async deleteTask(taskId: string): Promise<boolean> {
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
    }
  }
};
