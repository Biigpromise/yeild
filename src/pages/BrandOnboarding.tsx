
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandOnboardingExperience from '@/components/onboarding/BrandOnboardingExperience';

const BrandOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to brand dashboard after completion
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <BrandOnboardingExperience onComplete={handleComplete} />
    </div>
  );
};

export default BrandOnboarding;
