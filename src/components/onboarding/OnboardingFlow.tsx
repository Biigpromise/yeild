
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Star, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

interface OnboardingFlowProps {
  userType: 'user' | 'brand';
  onComplete: () => void;
}

const USER_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: <Play className="w-16 h-16" />,
    title: 'Ready to Earn?',
    description: 'Jump in and start completing tasks to earn points and rewards.'
  },
  {
    id: 'features',
    icon: <Star className="w-16 h-16" />,
    title: 'Love Your YEILD Experience?',
    description: 'Complete tasks, earn points, level up, and withdraw real money!'
  },
  {
    id: 'tasks',
    icon: <FileText className="w-16 h-16" />,
    title: 'Task-to-Reward Magic',
    description: 'Turn your completed tasks into real earnings with our point system.',
    isLast: true
  }
];

const BRAND_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: <Sparkles className="w-16 h-16" />,
    title: 'Ready to Create Campaigns?',
    description: 'Jump in and start creating engaging campaigns for our community.'
  },
  {
    id: 'features',
    icon: <Star className="w-16 h-16" />,
    title: 'Love Your YEILD Partnership?',
    description: 'Create campaigns, reach audiences, and track performance analytics!'
  },
  {
    id: 'reach',
    icon: <FileText className="w-16 h-16" />,
    title: 'Campaign-to-Audience Magic',
    description: 'Turn your brand campaigns into meaningful engagement with our platform.',
    isLast: true
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userType, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = userType === 'user' ? USER_STEPS : BRAND_STEPS;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-yeild-black z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-yeild-black border-yeild-yellow/20">
        <CardContent className="p-8 text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-yeild-yellow to-yeild-yellow-dark rounded-3xl flex items-center justify-center text-yeild-black">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">
              {step.title}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="bg-white text-yeild-black hover:bg-gray-100 px-8"
            >
              {step.isLast ? 'Get Started' : 'Next'} →
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-yeild-yellow" : "bg-gray-600"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
