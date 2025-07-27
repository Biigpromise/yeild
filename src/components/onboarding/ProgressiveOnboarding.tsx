
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
          {/* Success Stories */}
          <div className="space-y-6">
            {[
              { 
                name: "Sarah M.", 
                earnings: "$2,847", 
                period: "3 months",
                quote: "Started with simple tasks, now I'm earning consistently!",
                tasks: "127 tasks completed",
                image: "👩‍💼"
              },
              { 
                name: "Mike D.", 
                earnings: "$1,923", 
                period: "2 months",
                quote: "Perfect side hustle during my commute to work",
                tasks: "89 tasks completed",
                image: "👨‍💻"
              },
              { 
                name: "Jessica L.", 
                earnings: "$3,241", 
                period: "4 months",
                quote: "Bird referral system helped me earn even more!",
                tasks: "156 tasks + 23 referrals",
                image: "👩‍🎓"
              }
            ].map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gradient-to-r from-yeild-yellow/10 to-yellow-600/10 p-6 rounded-xl border border-yeild-yellow/30"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{user.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-lg text-white">{user.name}</span>
                      <span className="text-2xl font-bold text-yeild-yellow">{user.earnings}</span>
                      <span className="text-white/60 text-sm">in {user.period}</span>
                    </div>
                    <p className="text-white/80 mb-2">"{user.quote}"</p>
                    <p className="text-white/60 text-sm">{user.tasks}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center bg-white/5 p-4 rounded-xl">
            <p className="text-white font-semibold">
              <span className="text-yeild-yellow">Ready to be next?</span> Join 125,000+ earning users today!
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
          {/* Task Examples */}
          <div className="grid gap-4">
            {[
              { task: "Social Media Engagement", pay: "$15", time: "5 mins", icon: "👍" },
              { task: "Product Review", pay: "$25", time: "10 mins", icon: "⭐" },
              { task: "App Testing", pay: "$35", time: "15 mins", icon: "📱" },
              { task: "Survey Completion", pay: "$12", time: "8 mins", icon: "📝" }
            ].map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/10"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{task.icon}</div>
                  <div>
                    <h4 className="font-bold text-white">{task.task}</h4>
                    <p className="text-white/60 text-sm">{task.time} to complete</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yeild-yellow">{task.pay}</div>
              </motion.div>
            ))}
          </div>

          {/* Daily Stats */}
          <div className="bg-gradient-to-r from-green-500/20 to-yeild-yellow/20 p-6 rounded-xl border border-yeild-yellow/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-yeild-yellow mb-2">47,832</div>
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
              The More You Refer, The Higher You <span className="text-yeild-yellow">Fly</span>
            </h3>
            <p className="text-white/60">Each referral level unlocks bigger rewards and exclusive perks</p>
          </div>
          
          {/* Bird Levels */}
          <div className="space-y-4">
            {[
              { name: "🕊️ Dove", referrals: "1-4", points: "10 pts", description: "Your journey begins" },
              { name: "🦅 Hawk", referrals: "5-19", points: "20 pts", description: "Exclusive tasks unlocked" },
              { name: "🦅 Eagle", referrals: "20-99", points: "30 pts", description: "Premium task access" },
              { name: "🔥 Phoenix", referrals: "100+", points: "50 pts", description: "Maximum earning potential" }
            ].map((bird, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{bird.name.split(' ')[0]}</div>
                  <div>
                    <h4 className="font-bold text-white">{bird.name.split(' ').slice(1).join(' ')}</h4>
                    <p className="text-white/60 text-sm">{bird.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yeild-yellow font-bold">{bird.points}</div>
                  <div className="text-white/60 text-sm">{bird.referrals} refs</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-yeild-yellow/20 p-4 rounded-xl border border-yeild-yellow/30">
            <p className="text-center text-white">
              <span className="font-bold text-yeild-yellow">Bonus:</span> Phoenix users get 50% higher task payouts!
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
          {/* Live Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "125,487", label: "Active Users", trend: "+2,341 today" },
              { number: "387", label: "Top Brands", trend: "+12 this week" },
              { number: "$892K", label: "Paid Out", trend: "+$23K today" },
              { number: "4.9★", label: "User Rating", trend: "From 15K reviews" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="text-xl md:text-2xl font-bold text-yeild-yellow">{stat.number}</div>
                <div className="text-white font-medium text-sm">{stat.label}</div>
                <div className="text-white/60 text-xs mt-1">{stat.trend}</div>
              </motion.div>
            ))}
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-4 text-center">🏆 Top Earners This Month</h4>
            <div className="space-y-3">
              {[
                { rank: 1, name: "Alex K.", earnings: "$4,523", badge: "🥇" },
                { rank: 2, name: "Maria S.", earnings: "$3,847", badge: "🥈" },
                { rank: 3, name: "David L.", earnings: "$3,201", badge: "🥉" }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{user.badge}</span>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  <span className="text-yeild-yellow font-bold">{user.earnings}</span>
                </div>
              ))}
            </div>
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
            className="w-32 h-32 mx-auto bg-gradient-to-br from-yeild-yellow to-yellow-600 rounded-full flex items-center justify-center"
          >
            <DollarSign className="w-16 h-16 text-black" />
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Your YEILD Journey Starts Now!</h3>
            <p className="text-white/80 text-lg">
              Join thousands earning daily through simple tasks and referrals
            </p>
          </div>

          {/* Quick Start Steps */}
          <div className="space-y-4">
            {[
              { step: 1, action: "Browse available tasks", reward: "See instant pay rates" },
              { step: 2, action: "Complete your first task", reward: "Earn $5-$50" },
              { step: 3, action: "Share your referral code", reward: "Start building your bird level" }
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
              🎉 <span className="text-yeild-yellow">Welcome Bonus:</span> Complete your first task within 24 hours and get a 50% bonus!
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="text-center flex-1">
          <span className="text-yeild-yellow text-2xl font-bold">YEILD</span>
        </div>
        <button 
          onClick={handleSkip}
          className="text-white/60 hover:text-white text-sm"
        >
          Skip
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 mb-8">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full flex-1 transition-colors ${
                index <= currentSlide ? 'bg-yeild-yellow' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                {slides[currentSlide].title}
              </h1>
              <p className="text-white/60 text-lg">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6">
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
            className="bg-yeild-yellow text-black hover:bg-yellow-400"
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
