
import React from 'react';
import YieldOnboarding from './YieldOnboarding';

interface NewUserOnboardingProps {
  onComplete: () => void;
}

const NewUserOnboarding: React.FC<NewUserOnboardingProps> = ({ onComplete }) => {
  return <YieldOnboarding onComplete={onComplete} />;
};

export default NewUserOnboarding;
