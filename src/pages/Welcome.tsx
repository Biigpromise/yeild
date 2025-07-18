
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yeild-yellow/10 via-black to-black" />
      
      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-12"
        >
          <img 
            src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
            alt="YEILD Logo" 
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
          <h1 className="text-6xl md:text-8xl font-bold text-yeild-yellow">
            YEILD
          </h1>
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Button
            onClick={() => navigate('/auth')}
            className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
