
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";

export const taskSubmissionService = {
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
  }
};
