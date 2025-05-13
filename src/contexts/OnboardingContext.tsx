
import React, { createContext, useContext, useState, useEffect } from "react";

interface OnboardingContextType {
  showOnboarding: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  // Check if user has completed onboarding before
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("yeild-onboarding-completed");
    if (onboardingCompleted === "true") {
      setHasCompletedOnboarding(true);
    } else {
      // Always show tutorial for demo purposes, don't check for login status
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);
  
  const startOnboarding = () => {
    setShowOnboarding(true);
  };
  
  const completeOnboarding = () => {
    localStorage.setItem("yeild-onboarding-completed", "true");
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };
  
  const skipOnboarding = () => {
    setShowOnboarding(false);
  };
  
  return (
    <OnboardingContext.Provider 
      value={{ 
        showOnboarding, 
        startOnboarding, 
        completeOnboarding, 
        skipOnboarding,
        hasCompletedOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
