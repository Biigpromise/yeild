
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const TutorialButton: React.FC = () => {
  const { startOnboarding } = useOnboarding();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startOnboarding}
      className="flex items-center gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Help
    </Button>
  );
};
