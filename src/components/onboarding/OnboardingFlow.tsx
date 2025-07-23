
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NewUserOnboarding from './NewUserOnboarding';
import BrandOnboarding from './BrandOnboarding';
import { BirdProgressionOnboarding } from '@/components/bird/BirdProgressionOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
  }
  
  return (
    <div className="space-y-8">
      <BirdProgressionOnboarding />
      <NewUserOnboarding onComplete={onComplete} />
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
