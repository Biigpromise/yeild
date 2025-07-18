
import React from 'react';
import YieldOnboarding from './YieldOnboarding';

interface BrandOnboardingProps {
  onComplete: () => void;
}

const BrandOnboarding: React.FC<BrandOnboardingProps> = ({ onComplete }) => {
  return <YieldOnboarding onComplete={onComplete} />;
};

export default BrandOnboarding;
