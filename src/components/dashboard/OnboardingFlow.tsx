
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BirdProgressionOnboarding } from '@/components/referral/BirdProgressionOnboarding';
import NewUserOnboarding from '@/components/onboarding/NewUserOnboarding';
import BrandOnboarding from '@/components/onboarding/BrandOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  const handleOnboardingComplete = () => {
    onComplete();
  };

  if (userType === 'brand') {
    return <BrandOnboarding onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <div className="space-y-6">
      <BirdProgressionOnboarding onComplete={handleOnboardingComplete} />
      <NewUserOnboarding onComplete={handleOnboardingComplete} />
    </div>
  );
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = (props) => {
  return (
    <ErrorBoundary>
      <OnboardingFlowContent {...props} />
    </ErrorBoundary>
  );
};
