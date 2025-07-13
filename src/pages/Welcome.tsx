
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Building2 } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yeild-yellow/10 via-black to-black" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yeild-yellow/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <img 
            src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
            alt="YEILD Logo" 
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            Welcome
          </h1>
          <h2 className="text-4xl md:text-6xl font-light text-yeild-yellow">
            YEILDERS
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mt-6 max-w-2xl mx-auto">
            Transform your digital presence into rewards. Complete tasks, earn points, and unlock exclusive benefits.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              onClick={() => navigate('/auth')}
              className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 px-8 py-6 text-lg font-bold rounded-full flex items-center gap-3 min-w-[200px] group transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              Join as User
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={() => navigate('/brand-signup')}
              variant="outline"
              className="border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow hover:text-black px-8 py-6 text-lg font-bold rounded-full flex items-center gap-3 min-w-[200px] group transition-all duration-300 transform hover:scale-105"
            >
              <Building2 className="w-5 h-5" />
              Join as Brand
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <p className="text-gray-400 text-sm">
            Choose your path to start earning or creating opportunities
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-yeild-yellow text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Complete Tasks</h3>
            <p className="text-gray-400 text-sm">Engage with brands and complete simple tasks to earn rewards</p>
          </div>
          
          <div className="p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-yeild-yellow text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Earn Points</h3>
            <p className="text-gray-400 text-sm">Convert your engagement into valuable points you can redeem</p>
          </div>
          
          <div className="p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-yeild-yellow text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Level Up</h3>
            <p className="text-gray-400 text-sm">Build your referral network and unlock exclusive benefits</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
