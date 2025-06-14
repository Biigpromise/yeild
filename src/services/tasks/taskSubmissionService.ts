
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";

export const taskSubmissionService = {
  // Enhanced submit task with comprehensive validation and duplicate prevention
  async submitTask(taskId: string, evidence: string, timeSpent?: number): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log(`Attempting to submit task ${taskId} for user ${user.id}`);

      // First check if user has already submitted this task
      const { data: existingSubmission, error: checkError } = await supabase
        .from('task_submissions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing submission:', checkError);
        throw new Error("Failed to validate submission eligibility");
      }

      if (existingSubmission) {
        console.log('Duplicate submission attempt detected:', existingSubmission);
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
        console.error('Task not found:', taskError);
        throw new Error("Task not found or no longer available");
      }

      // Validate task is still active and not expired
      if (task.status !== 'active') {
        throw new Error("This task is no longer active");
      }

      if (task.expires_at && new Date(task.expires_at) < new Date()) {
        throw new Error("This task has expired");
      }

      // Get user stats for point calculation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, tasks_completed')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error("Failed to retrieve user information");
      }

      // Get tasks completed today for streak calculation
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTasks, error: todayError } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .gte('submitted_at', `${today}T00:00:00.000Z`)
        .lt('submitted_at', `${today}T23:59:59.999Z`);

      if (todayError) {
        console.error('Error fetching today\'s tasks:', todayError);
      }

      // Calculate points using the enhanced system
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
      console.log('Calculated points:', pointResult);

      // Attempt submission with duplicate protection
      const { error: submissionError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          evidence: evidence.trim(),
          status: 'pending',
          calculated_points: pointResult.finalPoints,
          point_breakdown: pointResult.breakdown,
          point_explanation: pointResult.explanation,
          submitted_at: new Date().toISOString()
        });

      if (submissionError) {
        console.error('Submission error:', submissionError);
        
        // Handle specific constraint violation (duplicate submission)
        if (submissionError.code === '23505' && submissionError.message.includes('unique_user_task_submission')) {
          toast.error("You have already submitted this task");
          return false;
        }
        
        // Handle other database errors
        throw new Error(`Submission failed: ${submissionError.message}`);
      }

      console.log('Task submitted successfully');
      toast.success(`Task submitted successfully! Calculated points: ${pointResult.finalPoints}`);
      return true;

    } catch (error) {
      console.error('Task submission error:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred during submission');
      }
      
      return false;
    }
  },

  // Check if user has already submitted a specific task
  async hasUserSubmittedTask(taskId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      const { data, error } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle();

      if (error) {
        console.error('Error checking task submission status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasUserSubmittedTask:', error);
      return false;
    }
  }
};
