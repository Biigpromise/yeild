
import React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

interface TutorialButtonProps {
  className?: string;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({ className = "" }) => {
  const { startOnboarding } = useOnboarding();
  
  return (
    <TooltipWrapper content="Start tutorial" side="left">
      <Button 
        onClick={startOnboarding}
        variant="outline" 
        size="icon"
        className={`rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-yeild-yellow ${className}`}
      >
        <HelpCircle className="h-5 w-5 text-yeild-yellow" />
      </Button>
    </TooltipWrapper>
  );
};
