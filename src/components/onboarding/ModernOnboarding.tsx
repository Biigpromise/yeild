import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Users,
  TrendingUp,
  Award,
  DollarSign,
  Zap,
  Shield,
  X
} from "lucide-react";

interface ModernOnboardingProps {
  onComplete: () => void;
}

const ModernOnboarding: React.FC<ModernOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to YEILD',
      subtitle: 'Professional task marketplace for verified users',
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Professional Task Platform
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Join a verified community of professionals earning through quality brand partnerships and skill-based tasks.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-lg font-bold text-primary">125K+</div>
              <div className="text-sm text-muted-foreground">Verified Users</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-lg font-bold text-primary">$2.8M</div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-lg font-bold text-primary">4.9★</div>
              <div className="text-sm text-muted-foreground">Platform Rating</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'earning',
      title: 'Professional Task Opportunities',
      subtitle: 'Quality work, competitive compensation',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Earn Through Quality Work
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Complete professional tasks from verified brands with transparent compensation and instant payouts.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { type: "Content Review", range: "$15-25", time: "10-15 min" },
              { type: "Brand Feedback", range: "$20-35", time: "15-20 min" },
              { type: "Product Testing", range: "$30-50", time: "20-30 min" }
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div>
                  <div className="font-medium text-foreground">{task.type}</div>
                  <div className="text-sm text-muted-foreground">{task.time} average</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{task.range}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Average: $28 per task</span>
            </div>
            <p className="text-sm text-muted-foreground">47,832 tasks completed today</p>
          </div>
        </div>
      )
    },
    {
      id: 'progression',
      title: 'Professional Growth System',
      subtitle: 'Advance your status, increase your earnings',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Tier-Based Advancement
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Build your professional network and unlock higher-value opportunities through our referral system.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { tier: "Associate", network: "1-4 referrals", bonus: "+10% earnings", color: "bg-slate-100" },
              { tier: "Professional", network: "5-19 referrals", bonus: "+15% earnings", color: "bg-blue-100" },
              { tier: "Senior", network: "20-49 referrals", bonus: "+20% earnings", color: "bg-purple-100" },
              { tier: "Executive", network: "100+ referrals", bonus: "+30% earnings", color: "bg-gradient-to-r from-yellow-100 to-orange-100" }
            ].map((tier, index) => (
              <div key={index} className={`p-4 rounded-xl border ${
                index === 3 ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{tier.tier}</div>
                    <div className="text-sm text-muted-foreground">{tier.network}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{tier.bonus}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Executive Benefits</span>
            </div>
            <p className="text-sm text-muted-foreground">Priority access to premium tasks and exclusive opportunities</p>
          </div>
        </div>
      )
    },
    {
      id: 'community',
      title: 'Verified Professional Network',
      subtitle: 'Join a trusted community of achievers',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Professional Community
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Connect with verified professionals and established brands in a secure, trustworthy environment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">JC</span>
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                    "Professional platform with reliable payouts. I've earned $3,200+ this quarter through quality brand partnerships."
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">Jessica Chen</span>
                    <span className="text-xs text-primary font-medium">Executive Tier</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">MR</span>
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                    "Excellent side income stream. The task quality is high and the referral system provides sustainable growth."
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">Michael Rodriguez</span>
                    <span className="text-xs text-primary font-medium">Senior Tier</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Ready to Begin',
      subtitle: 'Your professional journey starts now',
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Account Setup Complete
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              Your YEILD professional account is ready. Begin earning through quality brand partnerships.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { step: "Browse verified tasks", desc: "Quality opportunities from trusted brands" },
              { step: "Complete your first task", desc: "Professional work with instant payouts" },
              { step: "Build your network", desc: "Grow your tier status and earnings" },
              { step: "Access premium tasks", desc: "Unlock exclusive high-value opportunities" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.step}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Welcome Bonus</span>
            </div>
            <p className="text-sm text-muted-foreground">+25% earnings on your first completed task</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border border-border shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold text-primary">YEILD</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Skip
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-muted-foreground">
              {currentStepData.subtitle}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-primary w-6' 
                      : index < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModernOnboarding;