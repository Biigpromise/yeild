
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ModernOnboarding from './ModernOnboarding';
import BrandOnboarding from './BrandOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
  }

  // Use the new modern, professional onboarding
  return <ModernOnboarding onComplete={onComplete} />;
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = (props) => {
  return (
    <ErrorBoundary>
      <OnboardingFlowContent {...props} />
    </ErrorBoundary>
  );
};
