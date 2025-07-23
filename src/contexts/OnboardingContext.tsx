
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  showOnboarding: boolean;
  userType: 'user' | 'brand';
  completeOnboarding: () => void;
  setShowOnboarding: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userType, setUserType] = useState<'user' | 'brand'>('user');

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      
      if (!hasSeenOnboarding) {
        const isBrand = user.user_metadata?.user_type === 'brand' || 
                       user.user_metadata?.company_name;
        
        setUserType(isBrand ? 'brand' : 'user');
        setShowOnboarding(true);
        setIsOnboardingComplete(false);
      } else {
        setIsOnboardingComplete(true);
        setShowOnboarding(false);
      }
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'completed');
      setIsOnboardingComplete(true);
      setShowOnboarding(false);
    }
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        isOnboardingComplete, 
        showOnboarding, 
        userType, 
        completeOnboarding,
        setShowOnboarding 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
