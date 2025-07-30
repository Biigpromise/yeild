import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Target, 
  Users, 
  Wallet, 
  Trophy,
  MessageSquare,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YIELD! 🎉',
    description: 'We\'re excited to have you here! Let us show you around and help you get started on your earning journey.',
    icon: <Sparkles className="h-6 w-6" />,
    position: 'center',
    highlight: true
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center! Here you can see your points, level, and recent activity. Everything you need at a glance.',
    icon: <Trophy className="h-6 w-6" />,
    position: 'center'
  },
  {
    id: 'tasks',
    title: 'Complete Tasks & Earn',
    description: 'Click on Tasks to find available opportunities. Complete social media tasks, surveys, and more to earn points!',
    icon: <Target className="h-6 w-6" />,
    targetElement: '[data-tour="tasks-nav"]',
    position: 'right'
  },
  {
    id: 'social',
    title: 'Social Hub',
    description: 'Connect with other users, share your achievements, and build your network in our social community.',
    icon: <MessageSquare className="h-6 w-6" />,
    targetElement: '[data-tour="social-nav"]',
    position: 'right'
  },
  {
    id: 'referrals',
    title: 'Invite Friends & Earn More',
    description: 'Share your referral link and earn bonus points when friends join. The more you refer, the higher your bird level!',
    icon: <Users className="h-6 w-6" />,
    targetElement: '[data-tour="referrals-nav"]',
    position: 'right'
  },
  {
    id: 'wallet',
    title: 'Your Wallet',
    description: 'Track your earnings and withdraw your points when ready. Your hard work pays off here!',
    icon: <Wallet className="h-6 w-6" />,
    targetElement: '[data-tour="wallet-nav"]',
    position: 'right'
  },
  {
    id: 'birds',
    title: 'Bird Levels System',
    description: 'Level up from Dove to Phoenix! Each level unlocks new benefits and shows your achievement status.',
    icon: <Trophy className="h-6 w-6" />,
    targetElement: '[data-tour="birds-nav"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'Start by completing your first task or inviting a friend. Remember, every journey begins with a single step!',
    icon: <Sparkles className="h-6 w-6" />,
    position: 'center',
    highlight: true
  }
];

interface WelcomeTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ isOpen, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Add tour-active class to body to prevent scrolling
      document.body.classList.add('tour-active');
    } else {
      // Hide tour immediately when isOpen becomes false
      setIsVisible(false);
      document.body.classList.remove('tour-active');
    }

    return () => {
      document.body.classList.remove('tour-active');
    };
  }, [isOpen]);

  const updateTourProgress = async (step: number, completed: boolean = false) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_tours')
        .update({
          tour_step: step,
          tour_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error updating tour progress:', error);
      }
    } catch (error) {
      console.error('Error updating tour progress:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await updateTourProgress(nextStep);
    } else {
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateTourProgress(prevStep);
    }
  };

  const handleComplete = async () => {
    await updateTourProgress(currentStep, true);
    setIsVisible(false); // Immediately hide the tour
    toast.success('Welcome tour completed! 🎉');
    await onComplete();
  };

  const handleSkip = async () => {
    await updateTourProgress(currentStep, true);
    setIsVisible(false); // Immediately hide the tour
    await onSkip();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
      
      {/* Tour Card */}
      <div className={`fixed z-50 transition-all duration-300 ${
        step.position === 'center' 
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          : 'top-4 right-4'
      }`}>
        <Card className={`w-96 shadow-2xl border-2 ${
          step.highlight ? 'border-primary bg-gradient-to-br from-primary/5 to-background' : 'border-border'
        }`}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  step.highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {step.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>
                  Skip Tour
                </Button>
                <Button 
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
                  {currentStep !== tourSteps.length - 1 && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for tour */}
      <style>{`
        .tour-active {
          overflow: hidden;
        }
        
        [data-tour] {
          position: relative;
          z-index: 51;
        }
      `}</style>
    </>
  );
};