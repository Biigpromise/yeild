
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const NewUserOnboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        <div className="space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold">
            Welcome to <span className="text-yeild-yellow">YEILD!</span>
          </h1>
          <p className="text-xl text-gray-300">
            You're all set up and ready to start earning
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-yeild-yellow text-black hover:bg-yeild-yellow/90 py-6 text-lg font-bold rounded-lg"
        >
          Go to Dashboard
        </Button>
      </motion.div>
    </div>
  );
};

export default NewUserOnboarding;
