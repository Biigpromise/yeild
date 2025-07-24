
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

  console.log('OnboardingProvider: Initializing...');

  useEffect(() => {
    if (user) {
      console.log('OnboardingProvider: User found, checking onboarding status');
      
      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      
      // Determine user type based on user metadata or role
      const isBrand = user.user_metadata?.user_type === 'brand' || 
                     user.user_metadata?.company_name;
      
      // For brand users, show onboarding regardless of email confirmation
      // For regular users, require email confirmation
      if (!hasSeenOnboarding && (isBrand || user.email_confirmed_at)) {
        console.log('OnboardingProvider: Starting onboarding timer');
        
        setUserType(isBrand ? 'brand' : 'user');
        
        // Show onboarding after a short delay to allow page to load
        const timer = setTimeout(() => {
          console.log('OnboardingProvider: Showing onboarding');
          setShowOnboarding(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

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
