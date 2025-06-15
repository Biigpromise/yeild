import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { taskSubmissionService } from "./tasks/taskSubmissionService";
import { adminTaskService } from "./tasks/adminTaskService";
import { taskQueries } from "./tasks/taskQueries";

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  estimated_time?: string;
  brand_name?: string;
  brand_logo_url?: string;
  expires_at?: string;
  status: string;
  created_at: string;
  brand_user_id?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export const taskService = {
  // Get all active tasks for users
  async getTasks(): Promise<Task[]> {
    return await taskQueries.getTasks();
  },

  // Get task categories
  async getCategories(): Promise<TaskCategory[]> {
    return await taskQueries.getCategories();
  },

  // Submit a task
  async submitTask(taskId: string, evidence: string, timeSpent?: number): Promise<boolean> {
    return await taskSubmissionService.submitTask(taskId, evidence, timeSpent);
  },

  // Check if user has submitted a task
  async hasUserSubmittedTask(taskId: string): Promise<boolean> {
    return await taskSubmissionService.hasUserSubmittedTask(taskId);
  },

  // Get user's task submissions
  async getUserSubmissions(): Promise<any[]> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(title, points, category)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  },

  // Get user's completed tasks
  async getUserTasks(): Promise<any[]> {
    return await taskQueries.getUserTasks();
  },

  // Admin functions
  admin: adminTaskService
};
