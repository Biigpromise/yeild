
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";

export const taskSubmissionService = {
  async submitTask(taskId: string, evidence: string, timeSpent?: number): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("Please log in to submit tasks");
        return false;
      }

      // Check if user already submitted this task
      const { data: existingSubmission } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();

      if (existingSubmission) {
        toast.error("You have already submitted this task");
        return false;
      }

      // Get task details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        console.error('Error fetching task:', taskError);
        toast.error("Task not found");
        return false;
      }

      // Get user profile for point calculation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, tasks_completed, points')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error("Unable to fetch user profile");
        return false;
      }

      // Calculate points with advanced factors
      const pointFactors: PointCalculationFactors = {
        basePoints: task.points,
        difficulty: task.difficulty || 'medium',
        userLevel: profile?.level || 1,
        tasksCompletedToday: 0, // TODO: Calculate actual tasks completed today
        totalTasksCompleted: profile?.tasks_completed || 0,
        taskCategory: task.category || 'general'
      };

      const pointResult = pointCalculationService.calculatePoints(pointFactors);

      // Submit the task - ensure all fields are properly typed
      const submissionData = {
        user_id: user.id,
        task_id: taskId,
        evidence: evidence,
        calculated_points: pointResult.finalPoints,
        point_breakdown: pointResult.breakdown as any,
        point_explanation: pointResult.explanation,
        status: 'pending' as const
      };

      const { error } = await supabase
        .from('task_submissions')
        .insert(submissionData);

      if (error) {
        console.error('Error submitting task:', error);
        toast.error("Failed to submit task");
        return false;
      }

      // Record the submission in user_tasks table
      await supabase
        .from('user_tasks')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          status: 'submitted',
          started_at: new Date().toISOString()
        });

      toast.success("Task submitted successfully! Awaiting review.");
      return true;
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error("Failed to submit task");
      return false;
    }
  },

  async hasUserSubmittedTask(taskId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      const { data, error } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking task submission:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking task submission:', error);
      return false;
    }
  }
};
