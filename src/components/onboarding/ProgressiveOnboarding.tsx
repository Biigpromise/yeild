
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, UserPlus, Search, Upload, DollarSign, Trophy, Users, Star, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ProgressiveOnboardingProps {
  onComplete?: () => void;
}

const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 'success-stories',
      title: 'Real Success Stories',
      subtitle: 'Meet users earning thousands on YEILD',
      content: (
        <div className="space-y-8">
          {/* Success Stories - Condensed */}
          <div className="space-y-4">
            {[
              { 
                name: "Sarah M.", 
                earnings: "$2,847", 
                period: "3 months",
                image: "👩‍💼"
              },
              { 
                name: "Mike D.", 
                earnings: "$1,923", 
                period: "2 months",
                image: "👨‍💻"
              }
            ].map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gradient-to-r from-primary/10 to-primary/20 p-4 rounded-xl border border-primary/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{user.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white">{user.name}</span>
                      <span className="text-xl font-bold text-primary">{user.earnings}</span>
                      <span className="text-white/60 text-sm">in {user.period}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center bg-white/5 p-4 rounded-xl">
            <p className="text-white font-semibold">
              <span className="text-primary">Ready to be next?</span> Join 125,000+ earning users today!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'task-earnings',
      title: 'Easy Tasks, Real Money',
      subtitle: 'Start earning $5-$50 per task',
      content: (
        <div className="space-y-8">
          {/* Task Examples - Condensed */}
          <div className="grid gap-3">
            {[
              { task: "Social Media Engagement", pay: "$15", icon: "👍" },
              { task: "Product Review", pay: "$25", icon: "⭐" },
              { task: "App Testing", pay: "$35", icon: "📱" }
            ].map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{task.icon}</div>
                  <h4 className="font-bold text-white text-sm">{task.task}</h4>
                </div>
                <div className="text-xl font-bold text-primary">{task.pay}</div>
              </motion.div>
            ))}
          </div>

          {/* Daily Stats */}
          <div className="bg-gradient-to-r from-green-500/20 to-primary/20 p-6 rounded-xl border border-primary/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">47,832</div>
              <p className="text-white/80 mb-2">Tasks completed today</p>
              <p className="text-white/60 text-sm">Average payout: $23 per task</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bird-referrals',
      title: 'Bird Referral System',
      subtitle: 'Fly higher, earn more with referrals',
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">
              The More You Refer, The Higher You <span className="text-primary">Fly</span>
            </h3>
            <p className="text-white/60">Each referral level unlocks bigger rewards and exclusive perks</p>
          </div>
          
          {/* Bird Levels - Condensed */}
          <div className="space-y-3">
            {[
              { name: "🕊️ Dove", referrals: "1-4", points: "10 pts" },
              { name: "🦅 Hawk", referrals: "5-19", points: "20 pts" },
              { name: "🔥 Phoenix", referrals: "100+", points: "50 pts" }
            ].map((bird, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{bird.name.split(' ')[0]}</div>
                  <h4 className="font-bold text-white text-sm">{bird.name.split(' ').slice(1).join(' ')}</h4>
                </div>
                <div className="text-right">
                  <div className="text-primary font-bold text-sm">{bird.points}</div>
                  <div className="text-white/60 text-xs">{bird.referrals} refs</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-primary/20 p-4 rounded-xl border border-primary/30">
            <p className="text-center text-white">
              <span className="font-bold text-primary">Bonus:</span> Phoenix users get 50% higher task payouts!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'community-growth',
      title: 'Thriving Community',
      subtitle: 'Join thousands earning together',
      content: (
        <div className="space-y-8">
          {/* Live Stats - Condensed */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { number: "125K+", label: "Active Users" },
              { number: "387", label: "Top Brands" },
              { number: "$892K", label: "Paid Out" },
              { number: "4.9★", label: "User Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="text-lg font-bold text-primary">{stat.number}</div>
                <div className="text-white font-medium text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'start-earning',
      title: 'Ready to Start Earning?',
      subtitle: 'Your YEILD wallet is ready!',
      content: (
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center"
          >
            <DollarSign className="w-16 h-16 text-black" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Your YEILD Journey Starts Now!</h3>
            <p className="text-white/80 text-lg">
              Join thousands earning daily through simple tasks and referrals
            </p>
          </div>

          {/* Quick Start Steps - Condensed */}
          <div className="space-y-3">
            {[
              { step: 1, action: "Browse tasks", reward: "Earn $5-$50" },
              { step: 2, action: "Complete tasks", reward: "Instant payouts" },
              { step: 3, action: "Refer friends", reward: "Higher earnings" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/5 p-3 rounded-xl flex items-center space-x-3 border border-white/10"
              >
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xs">{item.step}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-sm">{item.action}</div>
                  <div className="text-primary text-xs">{item.reward}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/20 to-primary/30 p-6 rounded-xl border border-primary/30">
            <p className="text-white font-semibold">
              🎉 <span className="text-primary">Welcome Bonus:</span> Complete your first task within 24 hours and get a 50% bonus!
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
      // Complete onboarding instead of navigating directly
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    // Skip onboarding instead of navigating directly
    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <div className="text-center flex-1">
          <span className="text-primary text-2xl font-bold">YEILD</span>
        </div>
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-white/60 hover:text-white"
        >
          Skip
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full flex-1 transition-colors ${
                index <= currentSlide ? 'bg-primary' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content - Fixed height to prevent scrolling */}
      <div className="flex-1 px-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                {slides[currentSlide].title}
              </h1>
              <p className="text-white/60">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="px-6 py-4 flex-shrink-0 border-t border-white/10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-white/60 text-sm">
            {currentSlide + 1} of {slides.length}
          </div>

          <Button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveOnboarding;
