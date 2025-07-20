
import { useState } from 'react';
import { TaskValidator } from '@/services/tasks/taskValidation';
import { RateLimiter } from '@/services/security/rateLimiter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSecureSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTaskSubmission = async (
    submissionData: {
      task_id: string;
      evidence_url: string;
      description: string;
      social_media_handle?: string | null;
      status?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    
    try {
      // Rate limiting check
      const rateLimitKey = `task_submission`;
      if (!RateLimiter.isAllowed(rateLimitKey, 5, 3600000)) { // 5 submissions per hour
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Authentication required' };
      }

      // Submit to task_submissions table
      const { error: dbError } = await supabase
        .from('task_submissions')
        .insert({
          ...submissionData,
          user_id: user.id,
          submitted_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, error: 'Database submission failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Secure submission error:', error);
      return { success: false, error: 'Submission failed' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const secureSubmit = async (
    evidence: string,
    file: File | null,
    taskId: string,
    submitFn: (taskId: string, evidence: string, file?: File) => Promise<boolean>
  ): Promise<boolean> => {
    // Rate limiting check
    const rateLimitKey = `task_submission_${taskId}`;
    if (!RateLimiter.isAllowed(rateLimitKey, 3, 60000)) { // 3 submissions per minute
      const timeLeft = Math.ceil(RateLimiter.getTimeUntilReset(rateLimitKey) / 1000);
      toast.error(`Please wait ${timeLeft} seconds before submitting again`);
      return false;
    }

    // Validation
    const validation = TaskValidator.validateTaskSubmission(evidence, file || undefined);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await submitFn(taskId, evidence, file || undefined);
      if (success) {
        toast.success('Task submitted successfully!');
      }
      return success;
    } catch (error) {
      console.error('Secure submission error:', error);
      toast.error('Failed to submit task. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { secureSubmit, submitTaskSubmission, isSubmitting };
};
