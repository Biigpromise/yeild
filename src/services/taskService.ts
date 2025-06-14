import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "./pointCalculationService";

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

  // Enhanced submit task with point calculation
  async submitTask(taskId: string, evidence: string, timeSpent?: number): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      // Get task details
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (!task) throw new Error("Task not found");

      // Get user stats for point calculation
      const { data: profile } = await supabase
        .from('profiles')
        .select('level, tasks_completed')
        .eq('id', user.id)
        .single();

      // Get tasks completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTasks } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .gte('submitted_at', `${today}T00:00:00.000Z`)
        .lt('submitted_at', `${today}T23:59:59.999Z`);

      // Calculate points using the new system
      const pointFactors: PointCalculationFactors = {
        basePoints: task.points,
        difficulty: task.difficulty || 'medium',
        userLevel: profile?.level || 1,
        tasksCompletedToday: todayTasks?.length || 0,
        totalTasksCompleted: profile?.tasks_completed || 0,
        taskCategory: task.category || 'general',
        timeSpent
      };

      const pointResult = pointCalculationService.calculatePoints(pointFactors);

      // Submit with calculated points
      const { error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          evidence,
          status: 'pending',
          calculated_points: pointResult.finalPoints,
          point_breakdown: pointResult.breakdown,
          point_explanation: pointResult.explanation
        });

      if (error) throw error;
      
      toast.success(`Task submitted! Calculated points: ${pointResult.finalPoints}`);
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

    async updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected', notes?: string, qualityScore?: number): Promise<boolean> {
      try {
        const updateData: any = {
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        };

        // If approving and quality score provided, recalculate points
        if (status === 'approved' && qualityScore) {
          const { data: submission } = await supabase
            .from('task_submissions')
            .select(`
              *,
              tasks(*),
              profiles(level, tasks_completed)
            `)
            .eq('id', submissionId)
            .single();

          if (submission) {
            // Recalculate with quality score
            const pointFactors: PointCalculationFactors = {
              basePoints: submission.tasks.points,
              difficulty: submission.tasks.difficulty || 'medium',
              userLevel: submission.profiles.level || 1,
              tasksCompletedToday: 0, // Would need to calculate this
              totalTasksCompleted: submission.profiles.tasks_completed || 0,
              taskCategory: submission.tasks.category || 'general',
              qualityScore
            };

            const pointResult = pointCalculationService.calculatePoints(pointFactors);
            updateData.final_points = pointResult.finalPoints;
            updateData.quality_score = qualityScore;
          }
        }

        const { error } = await supabase
          .from('task_submissions')
          .update(updateData)
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
