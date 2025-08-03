
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, TaskCategory, TaskSubmission } from "../types/taskTypes";

// Helper function to safely transform social_media_links
const transformSocialMediaLinks = (links: any): Record<string, string> | null => {
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
};

// Helper function to transform database data to Task type
const transformDatabaseTask = (dbTask: any): Task => ({
  ...dbTask,
  social_media_links: transformSocialMediaLinks(dbTask.social_media_links)
});

export const taskQueries = {
  // Get all active tasks with proper category filtering
  async getTasks(): Promise<Task[]> {
    try {
      console.log('Fetching tasks from database...');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .not('category', 'is', null) // Exclude tasks without categories
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching tasks:', error);
        throw error;
      }

      console.log('Raw tasks from database:', data);
      const transformedTasks = (data || []).map(transformDatabaseTask);
      console.log('Transformed tasks:', transformedTasks);
      
      return transformedTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return [];
    }
  },

  // Get task categories with proper case names
  async getCategories(): Promise<TaskCategory[]> {
    try {
      console.log('Fetching categories from database...');
      
      const { data, error } = await supabase
        .from('task_categories')
        .select('id, name, description, icon, color')
        .order('name');

      if (error) {
        console.error('Database error fetching categories:', error);
        throw error;
      }

      console.log('Categories from database:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      return [];
    }
  },

  // Get user's task submissions with enhanced logging
  async getUserSubmissions(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user for submissions');
        return [];
      }

      console.log('Fetching submissions for user:', user.id);

      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!task_submissions_task_id_fkey(title, points, category)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Database error fetching submissions:', error);
        throw error;
      }

      console.log('User submissions from database:', data);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_tasks')
        .select(`
          *,
          tasks!user_tasks_task_id_fkey(title, points, category, brand_name)
        `)
        .eq('user_id', user.id)
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
