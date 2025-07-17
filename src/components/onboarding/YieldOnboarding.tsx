import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Users, Zap, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

const YieldOnboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showReferralMessage, setShowReferralMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for referral code and handle it
    const searchParams = new URLSearchParams(location.search);
    const referralCode = searchParams.get('ref');
    
    if (referralCode) {
      setShowReferralMessage(true);
      // The referral handling is already done in the signup process
      // This is just to show a nice welcome message
    }
  }, [location]);

  const slides = [
    {
      icon: Sparkles,
      title: "Welcome to YIELD",
      subtitle: "Your Journey Starts Here",
      description: "Discover endless opportunities to earn rewards by completing tasks and growing your network.",
      gradient: "from-yeild-yellow via-orange-500 to-red-500"
    },
    {
      icon: Target,
      title: "Complete Tasks",
      subtitle: "Earn as You Go",
      description: "Take on exciting challenges from top brands and get rewarded for your creativity and effort.",
      gradient: "from-blue-500 via-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Build Your Network",
      subtitle: "Refer & Earn",
      description: "Invite friends to join YIELD and unlock bonus rewards as your referral network grows.",
      gradient: "from-green-500 via-teal-500 to-blue-500"
    },
    {
      icon: Zap,
      title: "Level Up",
      subtitle: "Unlock Exclusive Benefits",
      description: "Progress through bird levels to access premium tasks, higher rewards, and VIP features.",
      gradient: "from-purple-500 via-pink-500 to-red-500"
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
                  <p className="font-semibold">Welcome bonus applied!</p>
                  <p className="text-sm opacity-90">You've joined through a referral link</p>
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
            Skip
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
              {/* Icon */}
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
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center shadow-2xl`}
                >
                  <Icon className="w-12 h-12 text-white" />
                </motion.div>
              </div>

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
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default YieldOnboarding;