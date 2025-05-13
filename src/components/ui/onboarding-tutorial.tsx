
import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { OnboardingImage } from "@/components/ui/onboarding-image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
  targetElement?: string; // CSS selector for element to highlight
}

interface OnboardingTutorialProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    setLoading(true);
    // Simulate saving the user's tutorial completion status
    setTimeout(() => {
      setLoading(false);
      onComplete();
      toast.success("Tutorial completed! You're all set to start using YEILD.");
    }, 800);
  };
  
  const handleSkip = () => {
    toast("Tutorial skipped. You can access it anytime from Settings.", {
      description: "You can always restart the tutorial later if needed."
    });
    onClose();
  };
  
  useEffect(() => {
    if (isOpen && steps[currentStep]?.targetElement) {
      const targetElement = document.querySelector(steps[currentStep].targetElement!);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect to the target element
        targetElement.classList.add('ring-2', 'ring-yeild-yellow', 'ring-offset-2', 'transition-all', 'duration-300');
        
        return () => {
          targetElement.classList.remove('ring-2', 'ring-yeild-yellow', 'ring-offset-2', 'transition-all', 'duration-300');
        };
      }
    }
  }, [isOpen, currentStep, steps]);
  
  if (!isOpen) return null;
  
  const currentStepData = steps[currentStep];
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-gray-900 border-t border-gray-800">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-bold flex items-center justify-between">
            <span className="text-yeild-yellow">{currentStepData.title}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-gray-300">{currentStepData.description}</p>
              
              <div className="flex items-center justify-between mt-8">
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-1.5 rounded-full ${
                        index === currentStep 
                          ? 'bg-yeild-yellow w-6' 
                          : 'bg-gray-700 w-2'
                      } transition-all duration-300`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
            </div>
            
            <OnboardingImage 
              step={currentStep + 1}
              altText={`Step ${currentStep + 1}: ${currentStepData.title}`}
              imageUrl={currentStepData.image}
            />
          </div>
        </div>
        
        <DrawerFooter className="border-t border-gray-800">
          <div className="flex justify-between w-full">
            <div>
              <Button 
                variant="outline" 
                className="border-gray-700 hover:bg-gray-800 hover:text-yeild-yellow"
                onClick={handleSkip}
              >
                Skip tutorial
              </Button>
            </div>
            <div className="flex space-x-2">
              <TooltipWrapper content="Previous step" side="top">
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
              
              <Button 
                className="bg-yeild-yellow text-black hover:bg-yeild-yellow-dark transition-all duration-300 flex items-center gap-2"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <LoadingState size="small" text="" />
                ) : (
                  <>
                    {currentStep < steps.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    ) : (
                      "Complete"
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
