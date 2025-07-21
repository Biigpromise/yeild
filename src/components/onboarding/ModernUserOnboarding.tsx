import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Trophy, TrendingUp, Users, Star, Gift, DollarSign, Target, Zap, Crown } from 'lucide-react';

interface ModernUserOnboardingProps {
  onComplete?: () => void;
}

const ModernUserOnboarding: React.FC<ModernUserOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const mockLeaderboard = [
    { name: "Sarah K.", level: "Phoenix", earnings: "$2,847", avatar: "🔥" },
    { name: "Mike R.", level: "Eagle", earnings: "$1,923", avatar: "🦅" },
    { name: "Lisa M.", level: "Hawk", earnings: "$1,567", avatar: "🦅" },
  ];

  const mockTestimonials = [
    { name: "Alex Thompson", earnings: "$3,200", quote: "YIELD changed my life! I earned more in 3 months than my part-time job.", bird: "Phoenix" },
    { name: "Maria Garcia", earnings: "$1,800", quote: "The referral system is incredible. My network keeps growing!", bird: "Eagle" },
    { name: "James Wilson", earnings: "$2,400", quote: "Simple tasks, real money. Perfect for students like me.", bird: "Hawk" },
  ];

  const steps = [
    {
      title: 'Welcome to the Future',
      subtitle: 'Where Tasks Meet Fortune',
      description: 'Join thousands earning real money while helping brands grow. Your journey to financial freedom starts here.',
      icon: <Zap className="w-16 h-16 text-yellow-400" />,
      color: 'from-purple-600/30 via-blue-600/30 to-cyan-500/30',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-500/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">$50K+</div>
              <div className="text-sm text-gray-300">Paid to Users</div>
            </div>
            <div className="p-4 bg-blue-500/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">15K+</div>
              <div className="text-sm text-gray-300">Active Users</div>
            </div>
            <div className="p-4 bg-purple-500/20 rounded-lg">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">500+</div>
              <div className="text-sm text-gray-300">Brands Trust Us</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Earnings Potential',
      subtitle: 'Real People, Real Money',
      description: 'See what our top performers are earning. Your potential is unlimited.',
      icon: <TrendingUp className="w-16 h-16 text-green-400" />,
      color: 'from-green-600/30 via-emerald-600/30 to-teal-500/30',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-400">$847</div>
            <div className="text-gray-300">Average monthly earnings</div>
          </div>
          {mockTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-green-400 font-medium">{testimonial.earnings} earned</div>
                </div>
                <Badge className="ml-auto bg-yellow-500/20 text-yellow-300">{testimonial.bird}</Badge>
              </div>
              <p className="text-gray-300 text-sm italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: 'Live Leaderboard',
      subtitle: 'Compete & Climb the Ranks',
      description: 'Watch as users evolve their birds and climb the earnings leaderboard in real-time.',
      icon: <Crown className="w-16 h-16 text-yellow-400" />,
      color: 'from-yellow-600/30 via-orange-600/30 to-red-500/30',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="text-lg text-gray-300 mb-2">Current Top Performers</div>
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                Live Rankings
              </Badge>
            </div>
          </div>
          {mockLeaderboard.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="text-2xl mr-3">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div className="text-3xl mr-4">{user.avatar}</div>
              <div className="flex-1">
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-sm text-gray-300">{user.level} Level</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">{user.earnings}</div>
                <div className="text-xs text-gray-400">This month</div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: 'Your Evolution Awaits',
      subtitle: 'From Dove to Phoenix',
      description: 'Start your journey as a Dove and evolve into legendary birds. Each level unlocks greater earning potential.',
      icon: '🔥',
      color: 'from-orange-600/30 via-red-600/30 to-pink-500/30',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">🕊️</div>
              <div className="font-semibold text-white">Dove</div>
              <div className="text-sm text-gray-300">Starting point</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">🦅</div>
              <div className="font-semibold text-white">Eagle</div>
              <div className="text-sm text-gray-300">Higher rewards</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">🦅</div>
              <div className="font-semibold text-white">Hawk</div>
              <div className="text-sm text-gray-300">Premium tasks</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-semibold text-white">Phoenix</div>
              <div className="text-sm text-gray-300">Maximum earning</div>
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="font-semibold text-yellow-300">Ready to begin your transformation?</div>
          </div>
        </div>
      )
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className={`bg-gradient-to-br ${currentStepData.color} backdrop-blur-xl border-white/20 shadow-2xl`}>
                <CardContent className="p-8 lg:p-12">
                  {/* Progress indicators */}
                  <div className="flex justify-center mb-8">
                    {steps.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: index <= currentStep ? 1.2 : 0.8 }}
                        className={`w-3 h-3 rounded-full mx-2 transition-all duration-300 ${
                          index <= currentStep 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-400/50' 
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Content */}
                    <div className="text-center lg:text-left">
                      {/* Icon */}
                      <motion.div 
                        className="mb-6 flex justify-center lg:justify-start"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        {typeof currentStepData.icon === 'string' ? (
                          <div className="text-8xl">{currentStepData.icon}</div>
                        ) : (
                          currentStepData.icon
                        )}
                      </motion.div>

                      {/* Text Content */}
                      <motion.div 
                        className="space-y-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                          {currentStepData.title}
                        </h1>
                        <h2 className="text-xl lg:text-2xl text-yellow-400 font-medium">
                          {currentStepData.subtitle}
                        </h2>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                          {currentStepData.description}
                        </p>
                      </motion.div>

                      {/* Actions */}
                      <motion.div 
                        className="flex gap-4 justify-center lg:justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          variant="outline"
                          onClick={handleSkip}
                          className="px-6 py-3 text-gray-300 border-gray-600 hover:bg-gray-800/50 backdrop-blur"
                        >
                          Skip
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold flex items-center gap-2 shadow-lg shadow-yellow-400/25"
                        >
                          {currentStep === steps.length - 1 ? 'Start Earning' : 'Continue'}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Right side - Interactive content */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="lg:max-h-96 overflow-y-auto custom-scrollbar"
                    >
                      {currentStepData.content}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModernUserOnboarding;