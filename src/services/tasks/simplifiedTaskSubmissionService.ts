import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const simplifiedTaskSubmissionService = {
  async submitTask(taskId: string, evidence: string, evidenceFiles?: File[]): Promise<boolean> {
    console.log('=== SIMPLIFIED TASK SUBMISSION START ===');
    
    try {
      // Step 1: Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Please log in to submit tasks");
      }

      // Step 2: Check for existing submission
      const { data: existingSubmission } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle();

      if (existingSubmission) {
        throw new Error("You have already submitted this task");
      }

      // Step 3: Get task details for points
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('points, title')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        throw new Error("Task not found");
      }

      // Step 4: Upload files if provided (simplified with better validation)
      let evidenceFileUrls: string[] = [];
      
      if (evidenceFiles && evidenceFiles.length > 0) {
        console.log('Uploading files...');
        
        for (let i = 0; i < evidenceFiles.length; i++) {
          const file = evidenceFiles[i];
          
          // Validate file
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
          }
          
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} is not supported. Please use images or videos.`);
          }
          
          const ext = file.name.split('.').pop();
          const filePath = `${user.id}/${taskId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          
          try {
            const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('task-evidence')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Upload failed:', uploadError);
              if (uploadError.message.includes('Row Level Security')) {
                throw new Error('Upload permission denied. Please try again or contact support.');
              }
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            const { data: pubUrl } = supabase
              .storage
              .from('task-evidence')
              .getPublicUrl(filePath);
            
            if (pubUrl?.publicUrl) {
              evidenceFileUrls.push(pubUrl.publicUrl);
            }
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            throw uploadError instanceof Error ? uploadError : new Error(`Failed to upload ${file.name}`);
          }
        }
      }

      // Step 5: Submit to database (simplified)
      const submissionData = {
        user_id: user.id,
        task_id: taskId,
        evidence: evidence || "Files submitted",
        evidence_file_url: evidenceFileUrls[0] || null,
        evidence_files: evidenceFileUrls,
        calculated_points: task.points, // Use base points for simplicity
        status: 'pending' as const,
        submitted_at: new Date().toISOString()
      };

      const { error: submissionError } = await supabase
        .from('task_submissions')
        .insert(submissionData);

      if (submissionError) {
        console.error('Submission error:', submissionError);
        throw new Error(`Failed to submit: ${submissionError.message}`);
      }

      // Step 6: Update user_tasks
      await supabase
        .from('user_tasks')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          status: 'submitted',
          started_at: new Date().toISOString()
        });

      toast.success("Task submitted successfully! Awaiting review.");
      console.log('=== TASK SUBMISSION SUCCESS ===');
      return true;
      
    } catch (error) {
      console.error('=== TASK SUBMISSION FAILED ===', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
        throw error;
      } else {
        const errorMsg = "Failed to submit task";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  },

  async hasUserSubmittedTask(taskId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking task submission:', error);
      return false;
    }
  }
};