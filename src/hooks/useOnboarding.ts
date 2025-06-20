
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userType, setUserType] = useState<'user' | 'brand'>('user');

  useEffect(() => {
    if (user) {
      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      
      if (!hasSeenOnboarding) {
        // Determine user type based on user metadata or role
        const isBrand = user.user_metadata?.user_type === 'brand' || 
                       user.user_metadata?.company_name;
        
        setUserType(isBrand ? 'brand' : 'user');
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'completed');
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    userType,
    completeOnboarding
  };
};
