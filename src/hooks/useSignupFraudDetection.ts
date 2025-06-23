
import { useEffect } from 'react';
import { fraudDetectionService } from '@/services/fraudDetectionService';
import { useAuth } from '@/contexts/AuthContext';

export const useSignupFraudDetection = () => {
  const { user } = useAuth();

  useEffect(() => {
    const storeSignupData = async () => {
      if (user) {
        try {
          await fraudDetectionService.storeSignupData(user.id);
        } catch (error) {
          console.error('Error storing signup fraud detection data:', error);
        }
      }
    };

    storeSignupData();
  }, [user]);
};
