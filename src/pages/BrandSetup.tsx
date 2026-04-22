import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BrandSetupWizard, Recommendation } from '@/components/brand/onboarding/BrandSetupWizard';

const STORAGE_KEY = 'brand_setup_recommendation';

const BrandSetup: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = (rec: Recommendation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
    } catch {}
    toast.success('Setup complete — recommendation saved');
    navigate('/brand-dashboard');
  };

  const handleSkip = () => navigate('/brand-dashboard');

  return <BrandSetupWizard onComplete={handleComplete} onSkip={handleSkip} />;
};

export default BrandSetup;
