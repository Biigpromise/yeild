
import React from "react";
import { OnboardingTutorial as OnboardingTutorialUI } from "@/components/ui/onboarding-tutorial";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { defaultOnboardingSteps } from "@/data/onboardingSteps";

export const OnboardingTutorial: React.FC = () => {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  
  return (
    <OnboardingTutorialUI
      steps={defaultOnboardingSteps}
      isOpen={showOnboarding}
      onClose={skipOnboarding}
      onComplete={completeOnboarding}
    />
  );
};
