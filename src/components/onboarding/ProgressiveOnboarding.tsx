
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, UserPlus, Search, Upload, DollarSign, Trophy, Users, Star, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ProgressiveOnboarding = () => {
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
            <h3 className="text-2xl font-bold text-white">Account Created Successfully!</h3>
            <p className="text-white/60 text-lg">
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
        <div className="space-y-8">
          {[
            { icon: UserPlus, title: "Sign Up", desc: "You're already here! ✓", completed: true },
            { icon: Search, title: "Pick a Task", desc: "Browse tasks from top brands" },
            { icon: Upload, title: "Submit Proof", desc: "Complete and upload evidence" },
            { icon: DollarSign, title: "Earn Instantly", desc: "Get paid upon approval" }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`flex items-center space-x-4 p-4 rounded-xl ${step.completed ? 'bg-green-500/20 border border-green-500' : 'bg-white/5 border border-white/10'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-yeild-yellow'}`}>
                <step.icon className={`w-6 h-6 ${step.completed ? 'text-white' : 'text-black'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-white">{step.title}</h4>
                <p className="text-white/60">{step.desc}</p>
              </div>
              {step.completed && <CheckCircle className="w-6 h-6 text-green-500" />}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'referral-system',
      title: 'The Higher You Fly',
      subtitle: 'Unlock rewards through referrals',
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">
              The More You Refer, The Higher You <span className="text-yeild-yellow">Fly</span>
            </h3>
            <p className="text-white/60">Build your network and unlock exclusive benefits</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Dove", referrals: 5, color: "text-gray-400", bgColor: "bg-gray-100" },
              { name: "Hawk", referrals: 20, color: "text-blue-400", bgColor: "bg-blue-100" },
              { name: "Eagle", referrals: 100, color: "text-green-400", bgColor: "bg-green-100" },
              { name: "Phoenix", referrals: 1000, color: "text-yeild-yellow", bgColor: "bg-yellow-100" }
            ].slice(0, 4).map((bird, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto ${bird.bgColor} rounded-full flex items-center justify-center mb-2`}>
                  <Trophy className={`w-8 h-8 ${bird.color}`} />
                </div>
                <h4 className={`font-bold ${bird.color}`}>{bird.name}</h4>
                <p className="text-white/60 text-sm">{bird.referrals}+</p>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-yeild-yellow/20 p-4 rounded-xl border border-yeild-yellow/30">
            <p className="text-center text-sm text-white">
              <span className="font-bold text-yeild-yellow">Pro Tip:</span> Share your referral code with friends to start climbing the ranks!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'community',
      title: 'Join the Community',
      subtitle: 'You\'re part of something bigger',
      content: (
        <div className="space-y-8">
          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { number: "47K+", label: "Tasks Today" },
              { number: "125K+", label: "Total Users" },
              { number: "387", label: "Brands" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="text-2xl md:text-3xl font-bold text-yeild-yellow">{stat.number}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Testimonials */}
          <div className="space-y-4">
            {[
              { name: "Sarah M.", earnings: "$2,847", quote: "Earned over $2,800 in 3 months!" },
              { name: "Mike D.", earnings: "$1,923", quote: "Perfect side hustle during commute" }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.2 }}
                className="bg-white/5 p-4 rounded-xl flex items-center space-x-4 border border-white/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yeild-yellow to-yellow-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-white">{testimonial.name}</span>
                    <span className="text-yeild-yellow font-bold">{testimonial.earnings}</span>
                  </div>
                  <p className="text-white/60 text-sm">"{testimonial.quote}"</p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yeild-yellow fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
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
