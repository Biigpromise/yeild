import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService, PointCalculationFactors } from "../pointCalculationService";
import { imageHashService } from "../imageHashService";

export const taskSubmissionService = {
  async submitTask(taskId: string, evidence: string, timeSpent?: number, evidenceFiles?: File[]): Promise<boolean> {
    console.log('=== TASK SUBMISSION START ===');
    console.log('Task ID:', taskId);
    console.log('Evidence length:', evidence?.length || 0);
    console.log('Files count:', evidenceFiles?.length || 0);
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

      // Step 4: Check for duplicate images globally if files are provided
      let validFiles: File[] = [];
      let duplicateFiles: string[] = [];
      
      if (evidenceFiles && evidenceFiles.length > 0) {
        console.log('Step 4: Checking for duplicate images...');
        const duplicateCheck = await imageHashService.checkMultipleFilesForDuplicates(evidenceFiles, user.id);
        validFiles = duplicateCheck.validFiles;
        duplicateFiles = duplicateCheck.duplicates;

        if (duplicateFiles.length > 0) {
          throw new Error(`The following images have already been used: ${duplicateFiles.join(', ')}. Please upload different screenshots.`);
        }

        if (validFiles.length === 0) {
          throw new Error("No valid files to upload. All files have been used before.");
        }

        console.log(`${validFiles.length} valid files to upload`);
      }

      // Step 5: Get user profile for point calculation
      console.log('Step 5: Getting user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, tasks_completed, points')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Warning: Could not fetch user profile:', profileError);
      }

      console.log('User profile:', profile || 'Not found');

      // Step 6: File upload logic for multiple files
      let evidenceFileUrls: string[] = [];
      
      if (validFiles.length > 0) {
        console.log('Step 6: Processing multiple file uploads...');
        
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const ext = file.name.split('.').pop();
          const filePath = `${user.id}/${taskId}/${Date.now()}_${i}.${ext}`;
          
          console.log(`Uploading file ${i + 1}/${validFiles.length} to path:`, filePath);
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('task-evidence')
            .upload(filePath, file);

          if (uploadError) {
            console.error(`File upload failed for ${file.name}:`, uploadError);
            throw new Error(`Failed to upload evidence file ${file.name}: ${uploadError.message}`);
          }

          // Get public URL
          const { data: pubUrl } = supabase
            .storage
            .from('task-evidence')
            .getPublicUrl(filePath);
          
          if (pubUrl?.publicUrl) {
            evidenceFileUrls.push(pubUrl.publicUrl);
          }
        }

        console.log(`Successfully uploaded ${evidenceFileUrls.length} files`);
      }

      // Step 7: Calculate points with enhanced factors
      console.log('Step 7: Calculating points...');
      let calculatedPoints = task.points;
      let pointBreakdown = null;
      let pointExplanation = `Base points for ${task.title}`;

      if (profile) {
        try {
          const pointFactors: PointCalculationFactors = {
            basePoints: task.points,
            difficulty: task.difficulty || 'medium',
            userLevel: profile.level || 1,
            tasksCompletedToday: 0,
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
        }
      }

      // Step 8: Submit the task
      console.log('Step 8: Submitting task to database...');
      const submissionData = {
        user_id: user.id,
        task_id: taskId,
        evidence: evidence || "Files submitted",
        evidence_file_url: evidenceFileUrls[0] || null, // Keep first file for backwards compatibility
        evidence_files: evidenceFileUrls, // Store all file URLs
        calculated_points: calculatedPoints,
        point_breakdown: pointBreakdown as any,
        point_explanation: pointExplanation,
        status: 'pending' as const,
        submitted_at: new Date().toISOString()
      };

      console.log('Submission data prepared:', {
        user_id: submissionData.user_id,
        task_id: submissionData.task_id,
        evidence_length: submissionData.evidence.length,
        status: submissionData.status,
        calculated_points: submissionData.calculated_points,
        files_count: evidenceFileUrls.length
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

      // Step 9: Store global image usage for all files
      if (validFiles.length > 0 && submission) {
        try {
          await imageHashService.storeMultipleGlobalUsage(
            validFiles,
            evidenceFileUrls,
            user.id,
            taskId,
            submission.id
          );
          console.log('Global image usage recorded for all files');
        } catch (hashError) {
          console.warn('Failed to store global image usage:', hashError);
        }
      }

      // Step 10: Record the submission in user_tasks table
      console.log('Step 10: Recording submission in user_tasks...');
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
      }

      // Step 11: Success feedback
      toast.success(`Task submitted successfully with ${evidenceFileUrls.length} file(s)! Awaiting review.`);
      
      console.log('=== TASK SUBMISSION SUCCESS ===');
      return true;
      
    } catch (error) {
      console.error('=== TASK SUBMISSION FAILED ===');
      console.error('Error details:', error);
      
      if (error instanceof Error) {
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

      console.log('Fetching submissions for user:', user.id);

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
