
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  category_id: string;
  difficulty: string;
  status: string;
  brand_name: string;
  brand_logo_url: string;
  estimated_time: string;
  expires_at: string;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence: string;
  submitted_at: string;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const taskService = {
  // Get all active tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_categories(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get task categories
  async getCategories() {
    const { data, error } = await supabase
      .from('task_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Submit a task
  async submitTask(taskId: string, evidence: string) {
    const { data, error } = await supabase
      .from('task_submissions')
      .insert({
        task_id: taskId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        evidence,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's task submissions
  async getUserSubmissions() {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks(*)
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user's completed tasks
  async getUserTasks() {
    const { data, error } = await supabase
      .from('user_tasks')
      .select(`
        *,
        tasks(*)
      `)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Admin functions
  admin: {
    // Get all tasks for admin
    async getAllTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Create a new task
    async createTask(task: Partial<Task>) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update task
    async updateTask(id: string, updates: Partial<Task>) {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Delete task
    async deleteTask(id: string) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    // Get all submissions for review
    async getAllSubmissions() {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(*),
          profiles!task_submissions_user_id_fkey(name, email)
        `)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Approve/reject submission
    async updateSubmissionStatus(id: string, status: 'approved' | 'rejected', adminNotes?: string) {
      const { data, error } = await supabase
        .from('task_submissions')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};
