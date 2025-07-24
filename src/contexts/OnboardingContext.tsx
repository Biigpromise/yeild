
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
        // Check multiple sources for brand status
        const [rolesResponse, profileResponse, applicationResponse] = await Promise.all([
          supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'brand'),
          supabase.from('brand_profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('brand_applications').select('*').eq('user_id', user.id).single()
        ]);

        const hasBrandRole = rolesResponse.data && rolesResponse.data.length > 0;
        const hasBrandProfile = profileResponse.data && !profileResponse.error;
        const hasBrandApplication = applicationResponse.data && !applicationResponse.error;
        
        const isBrandUser = hasBrandRole || hasBrandProfile || hasBrandApplication ||
                           user.user_metadata?.user_type === 'brand' ||
                           user.user_metadata?.company_name;

        setBrandStatus({
          hasBrandRole,
          hasBrandProfile,
          hasBrandApplication,
          isBrandUser
        });

        console.log('OnboardingProvider: Brand status checked', {
          hasBrandRole,
          hasBrandProfile,
          hasBrandApplication,
          isBrandUser,
          userMetadata: user.user_metadata
        });

      } catch (error) {
        console.error('Error checking brand status:', error);
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
      
      // Enhanced brand detection using fetched data
      const isBrand = brandStatus?.isBrandUser || false;
      
      console.log('OnboardingProvider: User type detection', { 
        isBrand, 
        brandStatus,
        userMetadata: user.user_metadata,
        hasSeenOnboarding
      });
      
      // Show onboarding for new users (both brand and regular)
      if (!hasSeenOnboarding) {
        // For brand users, show immediately
        // For regular users, require email confirmation
        if (isBrand || user.email_confirmed_at) {
          console.log('OnboardingProvider: Starting onboarding timer');
          
          setUserType(isBrand ? 'brand' : 'user');
          
          // Show onboarding after a short delay to allow page to load
          const timer = setTimeout(() => {
            console.log('OnboardingProvider: Showing onboarding for', isBrand ? 'brand' : 'user');
            setShowOnboarding(true);
          }, 1000);
          
          return () => clearTimeout(timer);
        }
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
