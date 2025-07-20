
import { useState } from 'react';
import { TaskValidator } from '@/services/tasks/taskValidation';
import { RateLimiter } from '@/services/security/rateLimiter';
import { toast } from 'sonner';

export const useSecureSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return { secureSubmit, isSubmitting };
};
