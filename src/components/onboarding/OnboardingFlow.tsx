
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
  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
  }

  // For regular users, show the simplified progressive onboarding
  // Skip the bird progression for now to avoid getting users stuck
  return <NewUserOnboarding onComplete={onComplete} />;
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = (props) => {
  return (
    <ErrorBoundary>
      <OnboardingFlowContent {...props} />
    </ErrorBoundary>
  );
};
