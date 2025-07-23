
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { BirdProgressionOnboarding } from '@/components/referral/BirdProgressionOnboarding';
import { ArrowRight, Users, DollarSign, Trophy } from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to YEILD! 🎉',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">👋</div>
          <h2 className="text-2xl font-bold">Welcome to the YEILD Platform!</h2>
          <p className="text-muted-foreground">
            You're about to embark on an exciting journey where you can earn money by completing tasks and building your referral network.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Complete Tasks</div>
              <div className="text-sm text-muted-foreground">Earn points and money</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Refer Friends</div>
              <div className="text-sm text-muted-foreground">Build your network</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Earn Money</div>
              <div className="text-sm text-muted-foreground">Get paid for your work</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'progression',
      title: 'Your Earning Journey',
      content: <BirdProgressionOnboarding />
    },
    {
      id: 'getting-started',
      title: 'Ready to Start? 🚀',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-bold">You're All Set!</h2>
          <p className="text-muted-foreground">
            Your journey begins as a <Badge className="bg-blue-500">🕊️ Dove</Badge>. Complete tasks, refer friends, and watch your earnings grow as you climb the bird ladder!
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Your First Steps:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium">Complete your first task</div>
                  <div className="text-muted-foreground">Browse available tasks and submit your first one</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium">Share your referral code</div>
                  <div className="text-muted-foreground">Invite friends and start building your network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentStepData.title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip Onboarding
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
