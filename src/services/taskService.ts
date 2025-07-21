
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
  social_media_links?: Record<string, string> | null;
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface CreateCampaignPayload {
  title: string;
  description: string;
  points?: number;
  category: string;
  difficulty: string;
  estimated_time?: string;
  expires_at?: string;
}

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

// Helper function to transform database task to Task interface
const transformTask = (dbTask: any): Task => ({
  ...dbTask,
  social_media_links: transformSocialMediaLinks(dbTask.social_media_links)
});

export const taskService = {
  // Get all active tasks for users
  async getTasks(): Promise<Task[]> {
    console.log('TaskService: Getting tasks...');
    const tasks = await taskQueries.getTasks();
    console.log('TaskService: Retrieved tasks:', tasks.length);
    return tasks.map(transformTask);
  },

  // Get task categories
  async getCategories(): Promise<TaskCategory[]> {
    console.log('TaskService: Getting categories...');
    const categories = await taskQueries.getCategories();
    console.log('TaskService: Retrieved categories:', categories.length);
    return categories;
  },

  // Submit a task with enhanced logging
  async submitTask(taskId: string, evidence: string, timeSpent?: number): Promise<boolean> {
    console.log('TaskService: Submitting task...', { taskId, evidenceLength: evidence?.length });
    
    try {
      const result = await taskSubmissionService.submitTask(taskId, evidence, timeSpent);
      console.log('TaskService: Submission result:', result);
      return result;
    } catch (error) {
      console.error('TaskService: Submission failed:', error);
      throw error;
    }
  },

  // Check if user has submitted a task
  async hasUserSubmittedTask(taskId: string): Promise<boolean> {
    return await taskSubmissionService.hasUserSubmittedTask(taskId);
  },

  // Get user's task submissions with enhanced logging
  async getUserSubmissions(): Promise<any[]> {
    try {
      console.log('TaskService: Getting user submissions...');
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.log('TaskService: No authenticated user');
        return [];
      }

      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(title, points, category)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('TaskService: Error fetching submissions:', error);
        throw error;
      }
      
      console.log('TaskService: Retrieved submissions:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('TaskService: Error in getUserSubmissions:', error);
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
      points: campaignData.points ?? 0,
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
    return transformTask(data);
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
    return transformTask(data);
  }
};
