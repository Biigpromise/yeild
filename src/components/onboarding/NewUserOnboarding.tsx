
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, UserPlus, Search, Upload, DollarSign, Trophy, Star, CheckCircle, Users, Target, Gift, TrendingUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const NewUserOnboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 'welcome',
      title: 'Welcome to YEILD!',
      subtitle: 'Your journey to earning starts here',
      content: (
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-32 h-32 mx-auto bg-yeild-yellow rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-16 h-16 text-black" />
          </motion.div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold">Account Created Successfully!</h3>
            <p className="text-gray-400 text-xl">
              You're now part of the YEILD community. Let's show you how to start earning.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'how-it-works',
      title: 'How YEILD Works',
      subtitle: 'Start earning in 4 simple steps',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              icon: UserPlus, 
              title: "1. Sign Up", 
              desc: "You're already here! ✓", 
              completed: true,
              gradient: "from-green-500 to-emerald-600"
            },
            { 
              icon: Search, 
              title: "2. Pick a Task", 
              desc: "Browse tasks from top brands",
              gradient: "from-blue-500 to-cyan-600"
            },
            { 
              icon: Upload, 
              title: "3. Submit Proof", 
              desc: "Complete and upload evidence",
              gradient: "from-purple-500 to-pink-600"
            },
            { 
              icon: DollarSign, 
              title: "4. Earn Instantly", 
              desc: "Get paid upon approval",
              gradient: "from-yeild-yellow to-yellow-600"
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`p-6 rounded-2xl border ${
                step.completed 
                  ? 'bg-green-500/10 border-green-500' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-4`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-xl mb-2">{step.title}</h4>
              <p className="text-gray-400">{step.desc}</p>
              {step.completed && <CheckCircle className="w-6 h-6 text-green-500 mt-2" />}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'features',
      title: 'Platform Features',
      subtitle: 'Everything you need to succeed',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Trophy,
              title: "Bird Levels",
              desc: "Climb from Dove to Phoenix through referrals",
              color: "text-yeild-yellow"
            },
            {
              icon: Users,
              title: "Community",
              desc: "Join 125K+ active users earning daily",
              color: "text-blue-400"
            },
            {
              icon: Target,
              title: "Tasks",
              desc: "Complete tasks from 387+ verified brands",
              color: "text-green-400"
            },
            {
              icon: Gift,
              title: "Rewards",
              desc: "Redeem points for gift cards and prizes",
              color: "text-purple-400"
            },
            {
              icon: TrendingUp,
              title: "Analytics",
              desc: "Track your progress and earnings",
              color: "text-orange-400"
            },
            {
              icon: Star,
              title: "Achievements",
              desc: "Unlock badges and bonus points",
              color: "text-pink-400"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700"
            >
              <feature.icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
              <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
            alt="YEILD Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-yeild-yellow text-xl font-bold">YEILD</span>
        </div>
        <button 
          onClick={handleSkip}
          className="text-gray-400 hover:text-white text-sm font-medium"
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
                index <= currentSlide ? 'bg-yeild-yellow' : 'bg-gray-700'
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
            className="h-full max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {slides[currentSlide].title}
              </h1>
              <p className="text-gray-400 text-xl">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            <div className="flex-1">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-gray-400 text-sm">
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

export default NewUserOnboarding;
