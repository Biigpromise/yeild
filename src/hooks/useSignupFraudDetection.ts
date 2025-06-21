
import { useEffect } from 'react';
import { integratedFraudDetectionService } from '@/services/integratedFraudDetectionService';
import { useAuth } from '@/contexts/AuthContext';

export const useSignupFraudDetection = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize fraud detection when a new user is authenticated
    if (user && user.id) {
      // Add a small delay to ensure user data is fully loaded
      const timer = setTimeout(() => {
        integratedFraudDetectionService.initializeUserFraudDetection(user.id);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);
};
