
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

const NewUserOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      id: 'level',
      title: "You're now a",
      subtitle: "BRONZE",
      highlight: "YEILDER",
      description: "Complete tasks and refer friends to level up!"
    },
    {
      id: 'video',
      title: "Learn How YEILD Works",
      subtitle: "Watch our intro video",
      description: "Get started with a quick overview"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleVideoClick = () => {
    // TODO: Replace with actual YouTube link when provided
    window.open('https://youtube.com/watch?v=YOUR_VIDEO_ID', '_blank');
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{currentStepData.title}</h1>
              <div className="text-6xl font-bold text-yeild-yellow">
                {currentStepData.subtitle}
              </div>
              <div className="text-3xl font-bold">
                {currentStepData.highlight}
              </div>
            </div>
            
            <div className="w-32 h-32 mx-auto bg-yeild-yellow rounded-full flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
            
            <p className="text-gray-300 text-lg">
              {currentStepData.description}
            </p>
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{currentStepData.title}</h1>
              <p className="text-xl text-gray-300">{currentStepData.subtitle}</p>
            </div>
            
            <div 
              onClick={handleVideoClick}
              className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600"
            >
              <div className="text-center space-y-2">
                <Play className="w-16 h-16 mx-auto text-yeild-yellow" />
                <p className="text-gray-400">Click to watch intro video</p>
                <p className="text-sm text-gray-500">Video will open on YouTube</p>
              </div>
            </div>
            
            <p className="text-gray-300">
              {currentStepData.description}
            </p>
          </>
        )}
        
        <Button 
          onClick={handleNext}
          className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg flex items-center justify-center gap-2"
        >
          {currentStep === steps.length - 1 ? (
            <>
              Start Earning
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </motion.div>
      
      {/* Progress indicator */}
      <div className="flex items-center space-x-2 mt-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep ? 'bg-yeild-yellow' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewUserOnboarding;
