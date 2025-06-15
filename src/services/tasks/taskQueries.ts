import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, TaskCategory, TaskSubmission } from "../types/taskTypes";

export const taskQueries = {
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
        .select('id, name')
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
          tasks(title, points, category)
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
  }
};
