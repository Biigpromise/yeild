import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";
import { imageHashService } from "../imageHashService";

export const taskSubmissionService = {
  async submitTask(taskId: string, evidence: string, timeSpent?: number, evidenceFile?: File): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("Please log in to submit tasks");
        return false;
      }

      // Validate inputs
      if (!evidence.trim() && !evidenceFile) {
        toast.error("Please provide evidence of task completion");
        return false;
      }

      if (evidence.trim().length < 10) {
        toast.error("Please provide more detailed evidence (at least 10 characters)");
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
      const pointFactors = {
        basePoints: task.points,
        difficulty: task.difficulty || 'medium',
        userLevel: profile?.level || 1,
        tasksCompletedToday: 0, // TODO: Calculate actual tasks completed today
        totalTasksCompleted: profile?.tasks_completed || 0,
        taskCategory: task.category || 'general'
      };

      const pointResult = await pointCalculationService.calculateEconomicPoints(user.id, taskId, pointFactors);

      // File upload logic with duplicate detection
      let evidenceFileUrl: string | undefined = undefined;
      let isDuplicateImage = false;
      
      if (evidenceFile) {
        // Generate hash for duplicate detection
        const fileHash = await imageHashService.generateFileHash(evidenceFile);
        
        // Check for duplicates
        const duplicateCheck = await imageHashService.checkForDuplicate(fileHash, user.id, taskId);
        
        if (duplicateCheck.isDuplicate) {
          isDuplicateImage = true;
          toast.warning("Possible duplicate image detected - submission flagged for admin review");
        }

        const ext = evidenceFile.name.split('.').pop();
        const filePath = `${user.id}/${taskId}/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('task-evidence')
          .upload(filePath, evidenceFile);

        if (uploadError) {
          console.error("File upload failed:", uploadError);
          toast.error("Failed to upload evidence file");
          return false;
        }

        // Build a public URL (the bucket is private, but project can serve files via download endpoint)
        const { data: pubUrl } = supabase
          .storage
          .from('task-evidence')
          .getPublicUrl(filePath);
        evidenceFileUrl = pubUrl?.publicUrl || null;

        // Store image hash for future duplicate detection
        await imageHashService.storeImageHash(fileHash, user.id, evidenceFileUrl, taskId);
      }

      // Submit the task - mark as pending review if duplicate detected
      const submissionData = {
        user_id: user.id,
        task_id: taskId,
        evidence: evidence,
        evidence_file_url: evidenceFileUrl,
        calculated_points: pointResult.finalPoints,
        point_breakdown: pointResult.breakdown as any,
        point_explanation: pointResult.explanation.join('\n'),
        status: isDuplicateImage ? 'flagged' as const : 'pending' as const,
        admin_notes: isDuplicateImage ? 'Flagged for possible duplicate image' : undefined
      };

      const { data: submission, error } = await supabase
        .from('task_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting task:', error);
        toast.error("Failed to submit task");
        return false;
      }

      // Update image hash with submission ID
      if (evidenceFile && submission) {
        const fileHash = await imageHashService.generateFileHash(evidenceFile);
        await supabase
          .from('image_hashes')
          .update({ submission_id: submission.id })
          .eq('hash_value', fileHash)
          .eq('user_id', user.id);
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

      if (isDuplicateImage) {
        toast.success("Task submitted but flagged for review due to possible duplicate image.");
      } else {
        toast.success("Task submitted successfully! Awaiting review.");
      }
      
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
