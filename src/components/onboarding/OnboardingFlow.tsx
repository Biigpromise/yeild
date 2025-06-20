
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Star, FileText, Sparkles, Quote, Bird } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BirdBadge } from '@/components/referral/BirdBadge';
import { BIRD_LEVELS } from '@/services/userService';

interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    rating: number;
  };
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
    description: 'Jump in and start completing tasks to earn points and rewards.',
    testimonial: {
      quote: "I've earned over $500 in my first month just by completing simple tasks during my free time. YEILD has been a game-changer!",
      author: "Sarah M.",
      role: "Verified User",
      rating: 5
    }
  },
  {
    id: 'birds',
    icon: <Bird className="w-16 h-16" />,
    title: 'Unlock Your Bird Badges',
    description: 'As you refer friends and earn points, you\'ll unlock prestigious bird badges that show your status in the community!'
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
    description: 'Jump in and start creating engaging campaigns for our community.',
    testimonial: {
      quote: "YEILD helped us reach 10,000+ engaged users in just 2 weeks. Our brand awareness increased by 300% and conversions are through the roof!",
      author: "Mike D.",
      role: "Marketing Director, TechCorp",
      rating: 5
    }
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "fill-yeild-yellow text-yeild-yellow" : "text-gray-400"
        )}
      />
    ));
  };

  const renderBirdProgression = () => {
    if (step.id !== 'birds') return null;

    return (
      <div className="bg-gray-800/50 rounded-lg p-4 border border-yeild-yellow/10 mt-4">
        <h3 className="text-lg font-semibold text-white mb-3 text-center">Bird Badge Progression</h3>
        <div className="grid grid-cols-2 gap-3">
          {BIRD_LEVELS.slice(0, 4).map((birdLevel, index) => (
            <div key={birdLevel.name} className="flex items-center space-x-2 p-2 bg-gray-700/30 rounded">
              <BirdBadge birdLevel={birdLevel} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{birdLevel.name}</p>
                <p className="text-xs text-gray-400">
                  {birdLevel.minReferrals === 0 ? 'Starting badge' : `${birdLevel.minReferrals}+ referrals`}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            Refer friends to unlock higher bird badges and earn bonus points!
          </p>
        </div>
      </div>
    );
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

          {/* Bird Progression */}
          {renderBirdProgression()}

          {/* Testimonial */}
          {step.testimonial && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-yeild-yellow/10">
              <Quote className="w-6 h-6 text-yeild-yellow mx-auto mb-3" />
              <p className="text-gray-300 text-sm italic mb-3">
                "{step.testimonial.quote}"
              </p>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {renderStars(step.testimonial.rating)}
              </div>
              <div className="text-center">
                <p className="font-semibold text-white text-sm">
                  {step.testimonial.author}
                </p>
                <p className="text-xs text-gray-400">
                  {step.testimonial.role}
                </p>
              </div>
            </div>
          )}

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
