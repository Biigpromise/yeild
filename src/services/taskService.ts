
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

export interface CreateCampaignPayload {
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  estimated_time?: string;
  expires_at?: string;
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
  admin: adminTaskService,

  // Brand functions
  async createCampaign(campaignData: CreateCampaignPayload): Promise<Task | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a campaign.");
      return null;
    }

    const campaignToInsert = {
      ...campaignData,
      brand_user_id: user.id,
      brand_name: user.user_metadata?.company_name,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(campaignToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      toast.error(`Failed to create campaign: ${error.message}`);
      return null;
    }

    toast.success("Campaign created successfully!");
    return data;
  },

  async updateCampaign(campaignId: string, campaignData: Partial<Task>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update(campaignData)
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      console.error("Error updating campaign:", error);
      toast.error(`Failed to update campaign: ${error.message}`);
      return null;
    }

    toast.success("Campaign updated successfully!");
    return data;
  }
};
