
import React from 'react';
import BirdJourneyOnboarding from './BirdJourneyOnboarding';

interface YieldOnboardingProps {
  onComplete?: () => void;
}

const YieldOnboarding: React.FC<YieldOnboardingProps> = ({ onComplete }) => {
  return <BirdJourneyOnboarding onComplete={onComplete} />;
};

export default YieldOnboarding;
