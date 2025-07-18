
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Users, Target, Gift, Trophy } from 'lucide-react';

interface BirdJourneyOnboardingProps {
  onComplete?: () => void;
}

const BirdJourneyOnboarding: React.FC<BirdJourneyOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to YIELD!',
      subtitle: 'Your Journey Begins',
      description: 'Start as a humble Dove and evolve into legendary birds by completing tasks and referring friends.',
      icon: '🕊️',
      color: 'from-blue-500/20 to-purple-500/20'
    },
    {
      title: 'Complete Tasks',
      subtitle: 'Earn Points & Experience',
      description: 'Take on various tasks to earn points. Each completed task brings you closer to your next bird evolution.',
      icon: <Target className="w-12 h-12 text-blue-400" />,
      color: 'from-green-500/20 to-blue-500/20'
    },
    {
      title: 'Refer Friends',
      subtitle: 'Build Your Flock',
      description: 'Invite friends to join YIELD. Active referrals help you unlock higher bird levels faster.',
      icon: <Users className="w-12 h-12 text-purple-400" />,
      color: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Level Up Your Bird',
      subtitle: 'Evolve & Unlock Rewards',
      description: 'From Dove to Phoenix - each bird level unlocks better rewards and special abilities.',
      icon: <Trophy className="w-12 h-12 text-yellow-400" />,
      color: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      title: 'Ready to Soar?',
      subtitle: 'Your Adventure Awaits',
      description: 'You\'re all set! Start completing tasks, invite friends, and watch your YEILDER bird evolve.',
      icon: '🚀',
      color: 'from-orange-500/20 to-red-500/20'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-yeild-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`bg-gradient-to-br ${currentStepData.color} border-yeild-yellow/20 shadow-2xl`}>
            <CardContent className="p-8 text-center">
              {/* Progress indicators */}
              <div className="flex justify-center mb-8">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                      index <= currentStep ? 'bg-yeild-yellow' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className="mb-6 flex justify-center">
                {typeof currentStepData.icon === 'string' ? (
                  <div className="text-6xl">{currentStepData.icon}</div>
                ) : (
                  currentStepData.icon
                )}
              </div>

              {/* Content */}
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-bold text-white">
                  {currentStepData.title}
                </h1>
                <h2 className="text-xl text-yeild-yellow font-medium">
                  {currentStepData.subtitle}
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-300 border-gray-600 hover:bg-gray-800"
                >
                  Skip Tutorial
                </Button>
                <Button
                  onClick={handleNext}
                  className="px-8 py-3 bg-yeild-yellow text-black hover:bg-yeild-yellow/90 font-semibold flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BirdJourneyOnboarding;
