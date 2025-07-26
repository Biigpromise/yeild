
import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NewUserOnboarding from './NewUserOnboarding';
import BrandOnboarding from './BrandOnboarding';
import { BirdProgressionOnboarding } from '@/components/bird/BirdProgressionOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
  }

  const handleBirdProgressionComplete = () => {
    setCurrentStep(1);
  };

  // Show bird progression first, then main onboarding
  if (currentStep === 0) {
  return <BirdProgressionOnboarding onComplete={handleBirdProgressionComplete} />;
  }
  
  return <NewUserOnboarding onComplete={onComplete} />;
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = (props) => {
  return (
    <ErrorBoundary>
      <OnboardingFlowContent {...props} />
    </ErrorBoundary>
  );
};
