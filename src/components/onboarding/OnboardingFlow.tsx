
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProgressiveOnboarding from './ProgressiveOnboarding';
import EnhancedUserOnboarding from './EnhancedUserOnboarding';
import BrandOnboarding from './BrandOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
  }

  // Use the new ProgressiveOnboarding with 5 enticing slides
  return <EnhancedUserOnboarding onComplete={onComplete} />;
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = (props) => {
  return (
    <ErrorBoundary>
      <OnboardingFlowContent {...props} />
    </ErrorBoundary>
  );
};
