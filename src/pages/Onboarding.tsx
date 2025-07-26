import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressiveOnboarding from '@/components/onboarding/ProgressiveOnboarding';

const Onboarding = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to dashboard and complete onboarding
    navigate('/dashboard');
  };

  return <ProgressiveOnboarding onComplete={handleComplete} />;
};

export default Onboarding;