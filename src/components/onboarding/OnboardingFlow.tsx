
import React from 'react';
import NewUserOnboarding from './NewUserOnboarding';
import BrandOnboarding from './BrandOnboarding';

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  if (userType === 'brand') {
    return <BrandOnboarding onComplete={onComplete} />;
  }

  return <NewUserOnboarding onComplete={onComplete} />;
};
