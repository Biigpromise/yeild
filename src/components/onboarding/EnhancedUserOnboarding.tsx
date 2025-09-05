import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Users, 
  Target, 
  DollarSign, 
  Trophy, 
  Star,
  CheckCircle,
  Zap,
  Gift,
  TrendingUp
} from "lucide-react";

interface EnhancedUserOnboardingProps {
  onComplete: () => void;
}

const EnhancedUserOnboarding: React.FC<EnhancedUserOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to YEILD',
      subtitle: 'Your journey to earning starts here',
      icon: Sparkles,
      content: (
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-glow-yellow"
          >
            <Sparkles className="w-16 h-16 text-primary-foreground" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Ready to Start Earning?
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Join over 125,000 users who are already earning through simple tasks and smart referrals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Users, number: "125K+", label: "Active Users" },
              { icon: DollarSign, number: "$2.8M", label: "Total Earned" },
              { icon: Trophy, number: "4.9★", label: "User Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="feature-card text-center hover:shadow-glow-yellow hover:-translate-y-1"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'earn-money',
      title: 'Earn Real Money',
      subtitle: 'Simple tasks, instant payouts',
      icon: DollarSign,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/20 to-primary/10 px-6 py-3 rounded-full mb-6"
            >
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">$5 - $50 per task</span>
            </motion.div>
          </div>

          <div className="grid gap-4">
            {[
              { task: "Social Media Engagement", pay: "$15", time: "5 min", icon: "💬" },
              { task: "Product Review", pay: "$25", time: "10 min", icon: "⭐" },
              { task: "App Testing", pay: "$35", time: "15 min", icon: "📱" },
              { task: "Video Testimonial", pay: "$50", time: "20 min", icon: "🎥" }
            ].map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="feature-card flex items-center justify-between hover:shadow-glow-yellow hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{task.icon}</div>
                  <div>
                    <h4 className="font-semibold text-foreground">{task.task}</h4>
                    <p className="text-sm text-muted-foreground">{task.time} average</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-primary">{task.pay}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="feature-card bg-gradient-to-r from-primary/10 to-primary/5 text-center shadow-glow-yellow"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">47,832 tasks completed today</span>
            </div>
            <p className="text-muted-foreground">Average payout: $23 per task</p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'referral-system',
      title: 'Bird Referral System',
      subtitle: 'Fly higher, earn more',
      icon: Trophy,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              The More You Refer, The Higher You Fly
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Each referral level unlocks bigger rewards, exclusive perks, and higher task payouts
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              { name: "🕊️ Dove", referrals: "1-4", points: "10 pts", bonus: "10% bonus" },
              { name: "🦅 Hawk", referrals: "5-19", points: "20 pts", bonus: "25% bonus" },
              { name: "🦚 Peacock", referrals: "20-49", points: "35 pts", bonus: "40% bonus" },
              { name: "🔥 Phoenix", referrals: "100+", points: "50 pts", bonus: "50% bonus" }
            ].map((bird, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`feature-card flex items-center justify-between hover:shadow-glow-yellow hover:-translate-y-1 ${
                  index === 3 ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{bird.name.split(' ')[0]}</div>
                  <div>
                    <h4 className="font-semibold text-foreground">{bird.name.split(' ').slice(1).join(' ')}</h4>
                    <p className="text-sm text-muted-foreground">{bird.referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{bird.points}</div>
                  <div className="text-sm text-muted-foreground">{bird.bonus}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="feature-card bg-gradient-to-r from-primary/20 to-primary/10 text-center shadow-glow-yellow"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">Phoenix Exclusive</span>
            </div>
            <p className="text-muted-foreground">
              Reach Phoenix status to unlock premium tasks with up to 50% higher payouts!
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'community',
      title: 'Thriving Community',
      subtitle: 'Join thousands earning together',
      icon: Users,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "125K+", label: "Active Users", icon: Users },
              { number: "387", label: "Top Brands", icon: Target },
              { number: "$2.8M", label: "Total Earned", icon: DollarSign },
              { number: "4.9★", label: "User Rating", icon: Star }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="feature-card text-center hover:shadow-glow-yellow hover:-translate-y-1"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-foreground">What Our Community Says</h3>
            
            {[
              { 
                quote: "YEILD changed my life! I now make more from tasks than my part-time job.",
                author: "Jessica T.",
                earnings: "$3,247/month",
                avatar: "👩‍🎓"
              },
              { 
                quote: "The referral system is amazing. I'm a Phoenix and earning 50% more per task!",
                author: "Marcus R.",
                earnings: "Phoenix Level",
                avatar: "👨‍💼"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.2 }}
                className="feature-card hover:shadow-glow-yellow hover:-translate-y-1"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <p className="text-muted-foreground italic mb-2">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{testimonial.author}</span>
                      <span className="text-sm text-primary font-bold">{testimonial.earnings}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'start',
      title: "Let's Get Started!",
      subtitle: 'Your YEILD wallet is ready',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center shadow-glow-yellow animate-pulse-subtle"
          >
            <CheckCircle className="w-16 h-16 text-primary-foreground" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Your YEILD Journey Starts Now!
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Everything is set up and ready. Let's start earning together!
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Quick Start Guide:</h4>
            
            {[
              { step: 1, action: "Browse available tasks", reward: "Find tasks you love" },
              { step: 2, action: "Complete your first task", reward: "Earn $5-$50 instantly" },
              { step: 3, action: "Invite your first friend", reward: "Start building your bird level" },
              { step: 4, action: "Keep earning & growing", reward: "Unlock higher payouts" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="feature-card flex items-center space-x-4 hover:shadow-glow-yellow hover:-translate-y-1"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{item.step}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">{item.action}</div>
                  <div className="text-sm text-primary">{item.reward}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="feature-card bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 shadow-glow-yellow"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gift className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">Welcome Bonus</span>
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <p className="text-foreground font-medium">
              Complete your first task within 24 hours and get a <span className="text-primary font-bold">50% bonus!</span>
            </p>
          </motion.div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card/90 backdrop-blur-sm border border-border shadow-xl hover:shadow-glow-yellow transition-all duration-500">
        <CardHeader className="text-center space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <div className="text-4xl font-bold text-primary glow-text animate-pulse-subtle">YEILD</div>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Skip
            </Button>
          </div>
          
          <Progress 
            value={((currentStep + 1) / steps.length) * 100} 
            className="mb-6 bg-muted/30 h-3 rounded-full overflow-hidden"
          />
          
          <div className="flex justify-center space-x-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-primary border-primary text-primary-foreground shadow-glow-yellow' 
                      : index === currentStep + 1
                      ? 'bg-primary/20 border-primary text-primary animate-pulse'
                      : 'bg-muted/20 border-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {index < currentStep && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardHeader>
        
        <CardContent className="px-6 sm:px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="min-h-[500px] flex flex-col"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {steps[currentStep].title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {steps[currentStep].subtitle}
                </p>
              </div>
              
              <div className="flex-1">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="order-2 sm:order-1 w-full sm:w-auto border-border hover:bg-muted/50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2 order-1 sm:order-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep ? 'bg-primary w-8' : 'bg-muted/50'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={handleNext}
              className="order-3 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-yellow hover:shadow-glow-yellow-lg transition-all"
            >
              {currentStep === steps.length - 1 ? 'Start Earning!' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUserOnboarding;