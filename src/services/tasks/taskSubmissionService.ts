import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";
import { imageHashService } from "../imageHashService";

export const taskSubmissionService = {
  async submitTask(taskId: string, evidence: string, timeSpent?: number, evidenceFile?: File): Promise<boolean> {
    console.log('=== TASK SUBMISSION START ===');
    console.log('Task ID:', taskId);
    console.log('Evidence length:', evidence?.length || 0);
    console.log('Has file:', !!evidenceFile);
    console.log('Time spent:', timeSpent);

    try {
      // Step 1: Get authenticated user
      console.log('Step 1: Getting authenticated user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        console.error('No authenticated user found');
        throw new Error("Please log in to submit tasks");
      }

      console.log('User authenticated:', user.id);

      // Step 2: Check for existing submission
      console.log('Step 2: Checking for existing submission...');
      const { data: existingSubmission, error: checkError } = await supabase
        .from('task_submissions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing submission:', checkError);
        throw new Error(`Database error while checking submissions: ${checkError.message}`);
      }

      if (existingSubmission) {
        console.error('Existing submission found:', existingSubmission);
        throw new Error("You have already submitted this task");
      }

      console.log('No existing submission found, proceeding...');

      // Step 3: Get task details
      console.log('Step 3: Getting task details...');
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
        console.error('Task not found in database');
        throw new Error("Task not found");
      }

      console.log('Task found:', { id: task.id, title: task.title, category: task.category });

      // Step 4: Get user profile for point calculation
      console.log('Step 4: Getting user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, tasks_completed, points')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Warning: Could not fetch user profile:', profileError);
        // Continue without profile data rather than failing
      }

      console.log('User profile:', profile || 'Not found');

      // Step 5: File upload logic with improved duplicate detection
      let evidenceFileUrl: string | undefined = undefined;
      let isDuplicateImage = false;
      
      if (evidenceFile) {
        console.log('Step 5: Processing file upload...');
        
        try {
          // Generate hash for duplicate detection with fallback
          let fileHash: string;
          try {
            fileHash = await imageHashService.generateFileHash(evidenceFile);
            console.log('Generated file hash successfully');
          } catch (hashError) {
            console.warn('File hashing failed, continuing without duplicate detection:', hashError);
            fileHash = `fallback_${evidenceFile.name}_${evidenceFile.size}_${Date.now()}`;
          }
          
          // Check for duplicates (optional - don't fail submission if this fails)
          try {
            const duplicateCheck = await imageHashService.checkForDuplicate(fileHash, user.id, taskId);
            if (duplicateCheck.isDuplicate) {
              isDuplicateImage = true;
              console.log('Duplicate image detected');
              toast.warning("Possible duplicate image detected - submission flagged for admin review");
            }
          } catch (duplicateError) {
            console.warn('Duplicate check failed, continuing without flagging:', duplicateError);
          }

          const ext = evidenceFile.name.split('.').pop();
          const filePath = `${user.id}/${taskId}/${Date.now()}.${ext}`;
          
          console.log('Uploading file to path:', filePath);
          
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
          console.log('File uploaded successfully to:', evidenceFileUrl);

          // Store image hash for future duplicate detection (optional)
          try {
            await imageHashService.storeImageHash(fileHash, user.id, evidenceFileUrl, taskId);
          } catch (hashStoreError) {
            console.warn('Failed to store image hash, continuing:', hashStoreError);
          }
        } catch (fileError) {
          console.error('File processing error:', fileError);
          throw new Error(`File upload failed: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

      // Step 6: Calculate points with enhanced factors
      console.log('Step 6: Calculating points...');
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
          
          console.log('Points calculated:', { base: task.points, calculated: calculatedPoints });
        } catch (pointError) {
          console.warn('Point calculation failed, using base points:', pointError);
          // Continue with base points if calculation fails
        }
      }

      // Step 7: Submit the task
      console.log('Step 7: Submitting task to database...');
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

      console.log('Submission data prepared:', {
        user_id: submissionData.user_id,
        task_id: submissionData.task_id,
        evidence_length: submissionData.evidence.length,
        status: submissionData.status,
        calculated_points: submissionData.calculated_points
      });

      const { data: submission, error: submissionError } = await supabase
        .from('task_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (submissionError) {
        console.error('Database submission error:', submissionError);
        throw new Error(`Failed to submit task: ${submissionError.message}`);
      }

      console.log('Task submission successful:', submission.id);

      // Step 8: Update image hash with submission ID (optional)
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

      // Step 9: Record the submission in user_tasks table
      console.log('Step 9: Recording submission in user_tasks...');
      try {
        await supabase
          .from('user_tasks')
          .upsert({
            user_id: user.id,
            task_id: taskId,
            status: 'submitted',
            started_at: new Date().toISOString()
          });
        
        console.log('User task record updated');
      } catch (userTaskError) {
        console.warn('Failed to update user_tasks:', userTaskError);
        // Don't fail the submission for this
      }

      // Step 10: Success feedback
      if (isDuplicateImage) {
        toast.success("Task submitted but flagged for review due to possible duplicate image.");
      } else {
        toast.success("Task submitted successfully! Awaiting review.");
      }
      
      console.log('=== TASK SUBMISSION SUCCESS ===');
      return true;
      
    } catch (error) {
      console.error('=== TASK SUBMISSION FAILED ===');
      console.error('Error details:', error);
      
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

      const hasSubmitted = !!data;
      console.log(`User has submitted task ${taskId}:`, hasSubmitted);
      return hasSubmitted;
    } catch (error) {
      console.error('Error checking task submission:', error);
      return false;
    }
  }
};
