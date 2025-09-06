
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingContextType {
  showOnboarding: boolean;
  userType: 'user' | 'brand';
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  startOnboarding: () => void;
  setUserType: (type: 'user' | 'brand') => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userType, setUserType] = useState<'user' | 'brand'>('user');
  const [brandStatus, setBrandStatus] = useState<any>(null);

  console.log('OnboardingProvider: Initializing...');

  useEffect(() => {
    const checkUserBrandStatus = async () => {
      if (!user) return;

      try {
        // Simple check with timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Brand status check timeout')), 3000)
        );

        const checkPromise = (async () => {
          // Quick check for brand indicators
          const isBrandFromMetadata = user.user_metadata?.user_type === 'brand' || 
                                     user.user_metadata?.company_name;

          if (isBrandFromMetadata) {
            return { isBrandUser: true };
          }

          // Only check database if metadata doesn't indicate brand
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'brand')
            .limit(1);

          return {
            isBrandUser: roles && roles.length > 0
          };
        })();

        const brandStatus = await Promise.race([checkPromise, timeoutPromise]) as any;
        setBrandStatus(brandStatus);

        console.log('OnboardingProvider: Brand status checked', {
          isBrandUser: brandStatus.isBrandUser,
          userMetadata: user.user_metadata
        });

      } catch (error) {
        console.error('Error checking brand status:', error);
        // Default to user type on error
        setBrandStatus({ isBrandUser: false });
      }
    };

    checkUserBrandStatus();
  }, [user]);

  useEffect(() => {
    if (user && brandStatus !== null) {
      console.log('OnboardingProvider: User found, checking onboarding status');
      
      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      
      // Simplified brand detection
      const isBrand = brandStatus?.isBrandUser || false;
      
      console.log('OnboardingProvider: User type detection', { 
        isBrand, 
        hasSeenOnboarding
      });
      
      // Set user type immediately
      setUserType(isBrand ? 'brand' : 'user');
      
      // Only show onboarding for new users who haven't seen it
      if (!hasSeenOnboarding) {
        console.log('OnboardingProvider: Showing onboarding for', isBrand ? 'brand' : 'user');
        setShowOnboarding(true);
      } else {
        console.log('OnboardingProvider: User has seen onboarding, hiding it');
        setShowOnboarding(false);
      }
    }
  }, [user, brandStatus]);

  const completeOnboarding = () => {
    console.log('OnboardingProvider: Completing onboarding');
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'completed');
      setShowOnboarding(false);
    }
  };

  const skipOnboarding = () => {
    console.log('OnboardingProvider: Skipping onboarding');
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'completed');
      setShowOnboarding(false);
    }
  };

  const startOnboarding = () => {
    console.log('OnboardingProvider: Starting onboarding manually');
    setShowOnboarding(true);
  };

  const value = {
    showOnboarding,
    userType,
    completeOnboarding,
    skipOnboarding,
    startOnboarding,
    setUserType
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
