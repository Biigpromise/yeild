
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Users, Zap, ArrowRight, X, Trophy, Crown, Star, Gem } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const BirdJourneyOnboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showReferralMessage, setShowReferralMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const referralCode = searchParams.get('ref');
    
    if (referralCode) {
      setShowReferralMessage(true);
    }
  }, [location]);

  const slides = [
    {
      icon: Sparkles,
      title: "Welcome to YIELD",
      subtitle: "Your Journey to Earning Begins",
      description: "Join thousands of YEILDers earning rewards through tasks, challenges, and building their network.",
      gradient: "from-yeild-yellow via-orange-500 to-red-500",
      bird: "🕊️",
      birdName: "New YEILDER",
      birdDesc: "Every journey starts with a single step"
    },
    {
      icon: Target,
      title: "Complete Tasks & Earn",
      subtitle: "Turn Your Skills Into Rewards",
      description: "Take on exciting challenges from top brands. Each completed task brings you points and helps you level up your bird status.",
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      bird: "🐦",
      birdName: "Active YEILDER",
      birdDesc: "Complete 5 tasks to unlock this level",
      progress: 20
    },
    {
      icon: Users,
      title: "Build Your Flock",
      subtitle: "Referrals = More Rewards",
      description: "Invite friends and family to join YIELD. Every person who joins through your link earns you bonus points and elevates your bird status.",
      gradient: "from-green-500 via-teal-500 to-blue-500",
      bird: "🦅",
      birdName: "Hawk YEILDER",
      birdDesc: "Refer 3+ friends to soar higher",
      progress: 40
    },
    {
      icon: Crown,
      title: "Rise Through The Ranks",
      subtitle: "From Dove to Phoenix",
      description: "As you complete more tasks and grow your network, you'll unlock exclusive bird levels with amazing benefits.",
      gradient: "from-purple-500 via-pink-500 to-red-500",
      bird: "🦅",
      birdName: "Eagle YEILDER",
      birdDesc: "Premium tasks & leaderboard access",
      progress: 60
    },
    {
      icon: Gem,
      title: "Reach Elite Status",
      subtitle: "The Phoenix Awaits",
      description: "Top performers become Phoenix YEILDers - the ultimate status with exclusive rewards, early access, and VIP treatment.",
      gradient: "from-red-500 via-orange-500 to-yellow-500",
      bird: "🔥",
      birdName: "Phoenix YEILDER",
      birdDesc: "Elite status with exclusive rewards",
      progress: 100,
      isPhoenix: true
    },
    {
      icon: Zap,
      title: "Ready to Start?",
      subtitle: "Your Bird Journey Begins Now",
      description: "Complete your first task, refer a friend, and watch your bird status soar. The sky is the limit!",
      gradient: "from-yeild-yellow via-green-500 to-blue-500",
      bird: "🚀",
      birdName: "Your Journey",
      birdDesc: "Ready to take off?"
    }
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Referral Success Message */}
      <AnimatePresence>
        {showReferralMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <div>
                  <p className="font-semibold">🎉 Referral Bonus Applied!</p>
                  <p className="text-sm opacity-90">You've joined through a friend's link</p>
                </div>
              </div>
              <Button
                onClick={() => setShowReferralMessage(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-10`}
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Skip button */}
        <div className="flex justify-end p-6">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Journey
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Bird Display */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center shadow-2xl ${currentSlideData.isPhoenix ? 'animate-pulse' : ''}`}
                >
                  <div className="text-6xl">{currentSlideData.bird}</div>
                  {currentSlideData.isPhoenix && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>
              </div>

              {/* Bird Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-muted/50 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{currentSlideData.birdName}</h3>
                  {currentSlideData.progress && (
                    <div className="text-sm text-muted-foreground">
                      {currentSlideData.progress}%
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{currentSlideData.birdDesc}</p>
                
                {currentSlideData.progress && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${currentSlideData.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentSlideData.progress}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                )}
              </motion.div>

              {/* Text content */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="text-4xl font-bold mb-2">{currentSlideData.title}</h1>
                  <p className="text-xl text-primary font-semibold">{currentSlideData.subtitle}</p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  {currentSlideData.description}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-6 space-y-6">
          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Button
              onClick={handleNext}
              className={`w-full py-4 rounded-xl bg-gradient-to-r ${currentSlideData.gradient} hover:opacity-90 transition-all duration-300 text-white font-semibold text-lg shadow-lg hover:shadow-xl group`}
            >
              <span className="flex items-center justify-center gap-2">
                {currentSlide === slides.length - 1 ? 'Start Your Journey' : 'Continue Journey'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BirdJourneyOnboarding;
