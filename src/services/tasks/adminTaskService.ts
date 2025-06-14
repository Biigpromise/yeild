
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/taskTypes";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";

export const adminTaskService = {
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
          tasks(title, points, category)
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
        // Get submission details
        const { data: submission } = await supabase
          .from('task_submissions')
          .select(`
            *,
            tasks(*)
          `)
          .eq('id', submissionId)
          .single();

        if (submission) {
          // Get user profile separately
          const { data: profile } = await supabase
            .from('profiles')
            .select('level, tasks_completed')
            .eq('id', submission.user_id)
            .single();

          if (profile) {
            // Recalculate with quality score
            const pointFactors: PointCalculationFactors = {
              basePoints: submission.tasks.points,
              difficulty: submission.tasks.difficulty || 'medium',
              userLevel: profile.level || 1,
              tasksCompletedToday: 0, // Would need to calculate this
              totalTasksCompleted: profile.tasks_completed || 0,
              taskCategory: submission.tasks.category || 'general',
              qualityScore
            };

            const pointResult = pointCalculationService.calculatePoints(pointFactors);
            updateData.final_points = pointResult.finalPoints;
            updateData.quality_score = qualityScore;
          }
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
};
