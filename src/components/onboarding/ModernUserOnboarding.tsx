
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Trophy, 
  Users, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Star,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernUserOnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to YIELD",
    subtitle: "Earn rewards for completing simple tasks",
    icon: Sparkles,
    color: "text-yeild-yellow"
  },
  {
    id: 2,
    title: "Complete Tasks",
    subtitle: "Choose from various tasks that match your interests",
    icon: Target,
    color: "text-yeild-yellow"
  },
  {
    id: 3,
    title: "Earn Points",
    subtitle: "Get points for every task you complete successfully",
    icon: Zap,
    color: "text-yeild-yellow"
  },
  {
    id: 4,
    title: "Unlock Rewards",
    subtitle: "Redeem your points for amazing rewards",
    icon: Gift,
    color: "text-yeild-yellow"
  },
  {
    id: 5,
    title: "Join the Community",
    subtitle: "Connect with other users and share your achievements",
    icon: Users,
    color: "text-yeild-yellow"
  },
  {
    id: 6,
    title: "Ready to Start!",
    subtitle: "Your journey begins now",
    icon: CheckCircle,
    color: "text-yeild-yellow"
  }
];

const ModernUserOnboarding: React.FC<ModernUserOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yeild-yellow mb-2">Welcome to YIELD</h2>
              <p className="text-muted-foreground">
                The platform where your time and effort turn into real rewards.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-yeild-yellow/10 rounded-lg">
                <Trophy className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Earn Rewards</p>
                <p className="text-xs text-muted-foreground">For completed tasks</p>
              </div>
              <div className="p-4 bg-yeild-yellow/10 rounded-lg">
                <Users className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Join Community</p>
                <p className="text-xs text-muted-foreground">Connect with others</p>
              </div>
              <div className="p-4 bg-yeild-yellow/10 rounded-lg">
                <Star className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Level Up</p>
                <p className="text-xs text-muted-foreground">Unlock new features</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <Target className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Complete Tasks</h2>
              <p className="text-muted-foreground mb-6">
                Choose from a variety of tasks that match your interests and skills.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yeild-yellow/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yeild-yellow/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yeild-yellow">1</span>
                  </div>
                  <span className="text-sm">Product Reviews</span>
                </div>
                <Badge variant="secondary" className="bg-yeild-yellow/20 text-yeild-yellow">Easy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yeild-yellow/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yeild-yellow/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yeild-yellow">2</span>
                  </div>
                  <span className="text-sm">Social Media Posts</span>
                </div>
                <Badge variant="secondary" className="bg-yeild-yellow/20 text-yeild-yellow">Medium</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yeild-yellow/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yeild-yellow/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yeild-yellow">3</span>
                  </div>
                  <span className="text-sm">App Testing</span>
                </div>
                <Badge variant="secondary" className="bg-yeild-yellow/20 text-yeild-yellow">Advanced</Badge>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Earn Points</h2>
              <p className="text-muted-foreground mb-6">
                Every completed task earns you points that you can redeem for real rewards.
              </p>
            </div>
            <div className="bg-yeild-yellow/10 p-6 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl font-bold text-yeild-yellow">+50</span>
                <span className="text-sm text-muted-foreground">points per task</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Higher difficulty tasks earn more points
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <Gift className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Unlock Rewards</h2>
              <p className="text-muted-foreground mb-6">
                Redeem your points for gift cards, cash, and exclusive items.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yeild-yellow/10 rounded-lg">
                <Gift className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Gift Cards</p>
                <p className="text-xs text-yeild-yellow">500+ points</p>
              </div>
              <div className="p-4 bg-yeild-yellow/10 rounded-lg">
                <Zap className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Cash Rewards</p>
                <p className="text-xs text-yeild-yellow">1000+ points</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Join the Community</h2>
              <p className="text-muted-foreground mb-6">
                Connect with other users, share tips, and celebrate achievements together.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-yeild-yellow/10 rounded-lg">
                <p className="text-sm font-medium mb-2">Community Features</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Share your achievements</p>
                  <p>• Chat with other users</p>
                  <p>• Participate in challenges</p>
                  <p>• Get help and support</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-yeild-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yeild-yellow mb-2">Ready to Start!</h2>
              <p className="text-muted-foreground">
                You're all set to begin your journey with YIELD. Start exploring tasks and earning rewards!
              </p>
            </div>
            <div className="bg-yeild-yellow/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Complete your first task to unlock the referral system and earn even more rewards!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yeild-black via-yeild-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-yeild-yellow/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-yeild-yellow">YIELD</div>
          </div>
          <Progress 
            value={(currentStep / steps.length) * 100} 
            className="mb-4"
          />
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full ${
                  index + 1 <= currentStep ? 'bg-yeild-yellow' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="border-yeild-yellow/20 text-yeild-yellow hover:bg-yeild-yellow/10"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-yeild-yellow hover:bg-yeild-yellow/90 text-yeild-black"
            >
              {currentStep === steps.length ? 'Get Started' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernUserOnboarding;
