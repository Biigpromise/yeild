
import { useCallback } from 'react';
import { integratedFraudDetectionService } from '@/services/integratedFraudDetectionService';
import { useAuth } from '@/contexts/AuthContext';

export const useTaskSubmissionFraudDetection = () => {
  const { user } = useAuth();

  const processSubmission = useCallback(async (
    taskId: string,
    submissionId: string,
    imageUrl: string
  ) => {
    if (!user?.id) {
      console.warn('No user found for fraud detection');
      return;
    }

    try {
      await integratedFraudDetectionService.processTaskSubmission(
        user.id,
        taskId,
        submissionId,
        imageUrl
      );
    } catch (error) {
      console.error('Task submission fraud detection failed:', error);
    }
  }, [user?.id]);

  return { processSubmission };
};
