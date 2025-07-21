
import React from 'react';
import ModernUserOnboarding from './ModernUserOnboarding';

interface NewUserOnboardingProps {
  onComplete: () => void;
}

const NewUserOnboarding: React.FC<NewUserOnboardingProps> = ({ onComplete }) => {
  return <ModernUserOnboarding onComplete={onComplete} />;
};

export default NewUserOnboarding;
