
import React from 'react';
import EnhancedUserOnboarding from './EnhancedUserOnboarding';

interface NewUserOnboardingProps {
  onComplete: () => void;
}

const NewUserOnboarding: React.FC<NewUserOnboardingProps> = ({ onComplete }) => {
  return <EnhancedUserOnboarding onComplete={onComplete} />;
};

export default NewUserOnboarding;
