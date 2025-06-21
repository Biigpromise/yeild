
import { useEffect } from 'react';
import { fraudDetectionService } from '@/services/fraudDetectionService';
import { useAuth } from '@/contexts/AuthContext';

export const useSignupFraudDetection = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Store signup data when a new user is authenticated
    if (user && user.id) {
      // Add a small delay to ensure user data is fully loaded
      const timer = setTimeout(() => {
        fraudDetectionService.storeSignupData(user.id);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);
};
