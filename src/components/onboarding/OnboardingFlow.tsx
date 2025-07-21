
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NewUserOnboarding from './NewUserOnboarding';
import BrandOnboarding from './BrandOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
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
