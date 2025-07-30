import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, UserPlus, Search, Upload, DollarSign, Trophy, Users, Star, CheckCircle, Copy } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EnhancedUserOnboardingProps {
  onComplete?: () => void;
}

const EnhancedUserOnboarding: React.FC<EnhancedUserOnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  const slides = [
    {
      id: 'welcome',
      title: 'Welcome to YIELD',
      subtitle: 'Your journey to earning starts here!',
      content: (
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-yeild-yellow to-yellow-600 rounded-full flex items-center justify-center"
          >
            <DollarSign className="w-16 h-16 text-black" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Transform Your Time Into Income</h3>
            <p className="text-white/80 text-lg">
              Join thousands earning daily through simple tasks and smart referrals
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Trophy, label: "Earn Money", desc: "Real cash rewards" },
              { icon: Users, label: "Refer & Earn", desc: "Build your network" },
              { icon: Star, label: "Level Up", desc: "Unlock bird badges" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <item.icon className="h-8 w-8 text-yeild-yellow mx-auto mb-2" />
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-yeild-yellow/20 p-4 rounded-xl border border-yeild-yellow/30">
            <p className="text-white font-semibold">
              🎉 <span className="text-yeild-yellow">Welcome Bonus:</span> Complete your first task within 24 hours for 50% extra points!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'bird-referral-system',
      title: 'YIELD Bird Progression System',
      subtitle: 'Evolve from Dove to Phoenix and maximize your earnings',
      content: (
        <div className="space-y-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-4 text-white">
              The More You Refer, The Higher You <span className="text-yeild-yellow">Fly</span>
            </h3>
            <p className="text-white/60">Each bird level unlocks higher earning multipliers and exclusive benefits</p>
          </div>
          
          {/* Enhanced Bird Levels with earning multipliers */}
          <div className="space-y-4">
            {[
              { 
                name: "🕊️ Dove", 
                referrals: "0-4 referrals", 
                points: "+10 pts per referral", 
                multiplier: "1x task earnings",
                description: "Your journey begins - standard task rewards",
                color: "from-blue-500/20 to-blue-600/20",
                borderColor: "border-blue-500/30"
              },
              { 
                name: "🐦 Sparrow", 
                referrals: "5-19 referrals", 
                points: "+15 pts per referral", 
                multiplier: "1.1x task earnings",
                description: "10% bonus on all task completions",
                color: "from-green-500/20 to-green-600/20",
                borderColor: "border-green-500/30"
              },
              { 
                name: "🦅 Hawk", 
                referrals: "20-49 referrals", 
                points: "+20 pts per referral", 
                multiplier: "1.25x task earnings",
                description: "25% bonus + exclusive task access",
                color: "from-purple-500/20 to-purple-600/20",
                borderColor: "border-purple-500/30"
              },
              { 
                name: "🦅 Eagle", 
                referrals: "50-99 referrals", 
                points: "+25 pts per referral", 
                multiplier: "1.4x task earnings",
                description: "40% bonus + priority task selection",
                color: "from-orange-500/20 to-orange-600/20",
                borderColor: "border-orange-500/30"
              },
              { 
                name: "🔥 Phoenix", 
                referrals: "100+ referrals", 
                points: "+35 pts per referral", 
                multiplier: "1.5x task earnings",
                description: "50% bonus + VIP features + early access",
                color: "from-red-500/20 to-yellow-600/20",
                borderColor: "border-red-500/30"
              }
            ].map((bird, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${bird.color} p-4 rounded-xl border ${bird.borderColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{bird.name.split(' ')[0]}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">{bird.name.split(' ').slice(1).join(' ')}</h4>
                      <p className="text-white/80 text-sm mb-2">{bird.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white/10 text-white/90 text-xs">
                          {bird.referrals}
                        </Badge>
                        <Badge variant="secondary" className="bg-yeild-yellow/20 text-yeild-yellow text-xs">
                          {bird.multiplier}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yeild-yellow font-bold text-lg">{bird.points}</div>
                    <div className="text-white/60 text-xs">per active referral</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Referral Code Section */}
          {user && (
            <Card className="bg-white/5 border-yeild-yellow/30">
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  <h4 className="font-bold text-white">Your Referral Code</h4>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="bg-black/30 px-4 py-2 rounded-lg text-yeild-yellow font-mono text-lg">
                      YIELD-{user.id.slice(0, 8).toUpperCase()}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`YIELD-${user.id.slice(0, 8).toUpperCase()}`);
                        toast.success('Referral code copied!');
                      }}
                      className="border-yeild-yellow/30 text-yeild-yellow hover:bg-yeild-yellow/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-white/60 text-sm">
                    Share this code with friends to start earning referral bonuses!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="bg-gradient-to-r from-yeild-yellow/20 to-yellow-600/20 p-6 rounded-xl border border-yeild-yellow/30">
            <div className="text-center">
              <p className="text-white font-semibold text-lg">
                🚀 <span className="text-yeild-yellow">Pro Tip:</span> Phoenix users earn 50% more on every task!
              </p>
              <p className="text-white/60 text-sm mt-2">
                The referral system is your fastest path to maximizing earnings
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'task-types',
      title: 'Simple Tasks, Real Money',
      subtitle: 'Choose tasks that match your skills and interests',
      content: (
        <div className="space-y-8">
          <div className="grid gap-4">
            {[
              { 
                category: "Social Media", 
                tasks: ["Like & Share posts", "Write reviews", "Follow accounts"],
                pay: "$5-$15", 
                time: "2-5 mins", 
                icon: "📱",
                difficulty: "Easy",
                difficultyColor: "bg-green-500/20 text-green-400"
              },
              { 
                category: "Content Creation", 
                tasks: ["Write product reviews", "Create short videos", "Take photos"],
                pay: "$10-$25", 
                time: "10-15 mins", 
                icon: "✍️",
                difficulty: "Medium",
                difficultyColor: "bg-yellow-500/20 text-yellow-400"
              },
              { 
                category: "Testing & Surveys", 
                tasks: ["Test apps", "Complete surveys", "Provide feedback"],
                pay: "$8-$20", 
                time: "5-12 mins", 
                icon: "🔍",
                difficulty: "Easy",
                difficultyColor: "bg-green-500/20 text-green-400"
              },
              { 
                category: "Data & Research", 
                tasks: ["Data entry", "Web research", "Fact checking"],
                pay: "$15-$35", 
                time: "15-30 mins", 
                icon: "📊",
                difficulty: "Advanced",
                difficultyColor: "bg-red-500/20 text-red-400"
              }
            ].map((taskType, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{taskType.icon}</div>
                    <div>
                      <h4 className="font-bold text-white">{taskType.category}</h4>
                      <Badge className={taskType.difficultyColor}>
                        {taskType.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yeild-yellow font-bold text-lg">{taskType.pay}</div>
                    <div className="text-white/60 text-sm">{taskType.time}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {taskType.tasks.map((task, taskIndex) => (
                    <p key={taskIndex} className="text-white/80 text-sm">• {task}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-yeild-yellow mb-2">47,832</div>
              <p className="text-white/80 mb-2">Tasks completed today</p>
              <p className="text-white/60 text-sm">Average payout: $18 per task</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Ready to Start Earning?',
      subtitle: 'Your YIELD journey begins now!',
      content: (
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-yeild-yellow to-yellow-600 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-16 h-16 text-black" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">You're All Set!</h3>
            <p className="text-white/80 text-lg">
              Start with simple tasks and watch your earnings grow
            </p>
          </div>

          <div className="space-y-3">
            {[
              { step: 1, action: "Browse available tasks", reward: "Choose what interests you" },
              { step: 2, action: "Complete your first task", reward: "Earn $5-$50 + bonus" },
              { step: 3, action: "Share your referral code", reward: "Start your bird progression" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/5 p-4 rounded-xl flex items-center space-x-4 border border-white/10"
              >
                <div className="w-8 h-8 bg-yeild-yellow rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">{item.step}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{item.action}</div>
                  <div className="text-yeild-yellow text-sm">{item.reward}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yeild-yellow/20 to-yellow-600/20 p-6 rounded-xl border border-yeild-yellow/30">
            <p className="text-white font-semibold">
              🎯 <span className="text-yeild-yellow">Quick Start Goal:</span> Complete 3 tasks this week to unlock premium features!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <div className="text-center flex-1">
          <span className="text-yeild-yellow text-2xl font-bold">YIELD</span>
        </div>
        <button 
          onClick={handleSkip}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full flex-1 transition-colors duration-300 ${
                index <= currentSlide ? 'bg-yeild-yellow' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-white/60 text-sm">
          {currentSlide + 1} of {slides.length}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="pb-4"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                {slides[currentSlide].title}
              </h1>
              <p className="text-white/60 text-lg">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="px-6 py-4 flex-shrink-0 border-t border-white/10">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="bg-yeild-yellow text-black hover:bg-yellow-400 font-semibold px-8"
          >
            {currentSlide === slides.length - 1 ? 'Start Earning!' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserOnboarding;