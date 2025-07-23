
import React from 'react';
import { motion } from 'framer-motion';

interface RealisticPhoenixBirdProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export const RealisticPhoenixBird: React.FC<RealisticPhoenixBirdProps> = ({
  size = 'md',
  animate = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-2xl',
    md: 'w-12 h-12 text-3xl',
    lg: 'w-16 h-16 text-4xl',
    xl: 'w-24 h-24 text-6xl'
  };

  const phoenixEmoji = '🔥'; // Using fire emoji as the most realistic phoenix representation

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}
      animate={animate ? {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Phoenix fire effect background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-20 animate-pulse" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-orange-400 opacity-30 blur-sm animate-pulse" />
      
      {/* Phoenix symbol */}
      <span className="relative z-10 filter drop-shadow-md">
        {phoenixEmoji}
      </span>
      
      {/* Sparkle effects */}
      {animate && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-80"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-1 h-1 bg-orange-400 rounded-full opacity-80"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          />
        </>
      )}
    </motion.div>
  );
};
