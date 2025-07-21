
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";
import { imageHashService } from "../imageHashService";

export const taskSubmissionService = {
  async submitTask(taskId: string, evidence: string, timeSpent?: number, evidenceFile?: File): Promise<boolean> {
    try {
      console.log('Task submission started:', { taskId, evidence: evidence.substring(0, 50) + '...', hasFile: !!evidenceFile });

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error("Please log in to submit tasks");
      }

      console.log('User authenticated:', user.id);

      // Check if user already submitted this task
      const { data: existingSubmission, error: checkError } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing submission:', checkError);
        throw new Error(`Database error while checking submissions: ${checkError.message}`);
      }

      if (existingSubmission) {
        throw new Error("You have already submitted this task");
      }

      console.log('No existing submission found, proceeding...');

      // Get task details
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) {
        console.error('Error fetching task:', taskError);
        throw new Error(`Task not found: ${taskError.message}`);
      }

      if (!task) {
        throw new Error("Task not found");
      }

      console.log('Task found:', task.title);

      // Get user profile for point calculation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, tasks_completed, points')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Continue without profile data rather than failing
        console.warn('Continuing without user profile data');
      }

      // File upload logic with duplicate detection
      let evidenceFileUrl: string | undefined = undefined;
      let isDuplicateImage = false;
      
      if (evidenceFile) {
        console.log('Processing file upload...');
        
        try {
          // Generate hash for duplicate detection
          const fileHash = await imageHashService.generateFileHash(evidenceFile);
          
          // Check for duplicates
          const duplicateCheck = await imageHashService.checkForDuplicate(fileHash, user.id, taskId);
          
          if (duplicateCheck.isDuplicate) {
            isDuplicateImage = true;
            console.log('Duplicate image detected');
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
            throw new Error(`Failed to upload evidence file: ${uploadError.message}`);
          }

          // Get public URL
          const { data: pubUrl } = supabase
            .storage
            .from('task-evidence')
            .getPublicUrl(filePath);
          
          evidenceFileUrl = pubUrl?.publicUrl || undefined;
          console.log('File uploaded successfully:', evidenceFileUrl);

          // Store image hash for future duplicate detection
          await imageHashService.storeImageHash(fileHash, user.id, evidenceFileUrl, taskId);
        } catch (fileError) {
          console.error('File processing error:', fileError);
          throw new Error(`File upload failed: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

      // Calculate points with enhanced factors (if profile available)
      let calculatedPoints = task.points;
      let pointBreakdown = null;
      let pointExplanation = `Base points for ${task.title}`;

      if (profile) {
        try {
          const pointFactors: PointCalculationFactors = {
            basePoints: task.points,
            difficulty: task.difficulty || 'medium',
            userLevel: profile.level || 1,
            tasksCompletedToday: 0, // TODO: Calculate actual tasks completed today
            totalTasksCompleted: profile.tasks_completed || 0,
            taskCategory: task.category || 'general'
          };

          const pointResult = await pointCalculationService.calculateEconomicPoints(user.id, taskId, pointFactors);
          calculatedPoints = pointResult.finalPoints;
          pointBreakdown = pointResult.breakdown;
          pointExplanation = pointResult.explanation.join('\n');
        } catch (pointError) {
          console.warn('Point calculation failed, using base points:', pointError);
          // Continue with base points if calculation fails
        }
      }

      // Submit the task - mark as pending review if duplicate detected
      const submissionData = {
        user_id: user.id,
        task_id: taskId,
        evidence: evidence,
        evidence_file_url: evidenceFileUrl,
        calculated_points: calculatedPoints,
        point_breakdown: pointBreakdown as any,
        point_explanation: pointExplanation,
        status: isDuplicateImage ? 'flagged' as const : 'pending' as const,
        admin_notes: isDuplicateImage ? 'Flagged for possible duplicate image' : undefined,
        submitted_at: new Date().toISOString()
      };

      console.log('Submitting task with data:', { ...submissionData, evidence: evidence.substring(0, 50) + '...' });

      const { data: submission, error: submissionError } = await supabase
        .from('task_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (submissionError) {
        console.error('Error submitting task:', submissionError);
        throw new Error(`Failed to submit task: ${submissionError.message}`);
      }

      console.log('Task submission successful:', submission.id);

      // Update image hash with submission ID
      if (evidenceFile && submission) {
        try {
          const fileHash = await imageHashService.generateFileHash(evidenceFile);
          await supabase
            .from('image_hashes')
            .update({ submission_id: submission.id })
            .eq('hash_value', fileHash)
            .eq('user_id', user.id);
        } catch (hashError) {
          console.warn('Failed to update image hash:', hashError);
          // Don't fail the submission for this
        }
      }

      // Record the submission in user_tasks table
      try {
        await supabase
          .from('user_tasks')
          .upsert({
            user_id: user.id,
            task_id: taskId,
            status: 'submitted',
            started_at: new Date().toISOString()
          });
      } catch (userTaskError) {
        console.warn('Failed to update user_tasks:', userTaskError);
        // Don't fail the submission for this
      }

      if (isDuplicateImage) {
        toast.success("Task submitted but flagged for review due to possible duplicate image.");
      } else {
        toast.success("Task submitted successfully! Awaiting review.");
      }
      
      return true;
    } catch (error) {
      console.error('Task submission failed:', error);
      
      if (error instanceof Error) {
        // Re-throw known errors to preserve error messages
        throw error;
      } else {
        throw new Error("Failed to submit task due to an unexpected error");
      }
    }
  },

  async hasUserSubmittedTask(taskId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
