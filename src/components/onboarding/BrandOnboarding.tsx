
import React from 'react';
import BrandOnboardingExperience from './BrandOnboardingExperience';

interface BrandOnboardingProps {
  onComplete: () => void;
}

const BrandOnboarding: React.FC<BrandOnboardingProps> = ({ onComplete }) => {
  return <BrandOnboardingExperience onComplete={onComplete} />;
};

export default BrandOnboarding;
