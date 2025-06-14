
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
          tasks(title, points, category, difficulty),
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
        .insert({
          title: taskData.title,
          description: taskData.description,
          points: taskData.points,
          difficulty: taskData.difficulty,
          category: taskData.category,
          estimated_time: taskData.estimated_time,
          expires_at: taskData.expires_at,
          brand_name: taskData.brand_name,
          brand_logo_url: taskData.brand_logo_url,
          status: taskData.status || 'active'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected', notes?: string, qualityScore?: number): Promise<boolean> {
    try {
      // Get submission details first
      const { data: submission, error: fetchError } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(*),
          profiles(id, level, tasks_completed, points)
        `)
        .eq('id', submissionId)
        .single();

      if (fetchError || !submission) {
        console.error('Error fetching submission:', fetchError);
        return false;
      }

      const updateData: any = {
        status,
        admin_notes: notes,
        reviewed_at: new Date().toISOString()
      };

      // If approving, handle point awarding
      if (status === 'approved') {
        let finalPoints = submission.calculated_points || submission.tasks.points;

        // If quality score provided, recalculate points
        if (qualityScore) {
          const pointFactors: PointCalculationFactors = {
            basePoints: submission.tasks.points,
            difficulty: submission.tasks.difficulty || 'medium',
            userLevel: submission.profiles.level || 1,
            tasksCompletedToday: 0,
            totalTasksCompleted: submission.profiles.tasks_completed || 0,
            taskCategory: submission.tasks.category || 'general',
            qualityScore
          };

          const pointResult = pointCalculationService.calculatePoints(pointFactors);
          finalPoints = pointResult.finalPoints;
          updateData.calculated_points = finalPoints;
          updateData.point_breakdown = pointResult.breakdown;
          updateData.point_explanation = pointResult.explanation;
        }

        // Award points to user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            points: submission.profiles.points + finalPoints,
            tasks_completed: submission.profiles.tasks_completed + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.user_id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          return false;
        }

        // Record point transaction
        await supabase
          .from('point_transactions')
          .insert({
            user_id: submission.user_id,
            points: finalPoints,
            transaction_type: 'task_completion',
            reference_id: submission.task_id,
            description: `Task completed: ${submission.tasks.title}`
          });
      }

      // Update submission
      const { error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) {
        console.error('Error updating submission:', error);
        return false;
      }

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
