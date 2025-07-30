
import React from 'react';
import { motion } from 'framer-motion';
import phoenixImage from '@/assets/phoenix-bird.png';

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
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center cursor-pointer group`}
      animate={animate ? {
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0],
      } : {}}
      whileHover={{
        scale: 1.15,
        rotate: [0, 3, -3, 0],
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Enhanced fire effect background - intensifies on hover */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 opacity-20"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        whileHover={{
          scale: [1.2, 1.4, 1.2],
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 0.6, repeat: Infinity }
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Golden glow effect - brightens on hover */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 opacity-30 blur-sm"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        whileHover={{
          scale: [1.3, 1.5, 1.3],
          opacity: [0.5, 0.7, 0.5],
          transition: { duration: 0.4, repeat: Infinity }
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Outer energy ring - appears on hover */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-0 group-hover:opacity-60"
        animate={{
          scale: [1.5, 1.8, 1.5],
          rotate: [0, 360]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Phoenix Image with Flapping Animation */}
      <motion.img
        src={phoenixImage}
        alt="Phoenix Bird"
        className="relative z-10 w-full h-full object-contain rounded-lg"
        animate={{
          scale: animate ? [1, 1.05, 1] : 1,
          rotateY: animate ? [0, 5, -5, 0] : 0,
          // Wing flapping effect
          scaleX: animate ? [1, 1.02, 1, 0.98, 1] : 1,
        }}
        whileHover={{
          scale: 1.1,
          rotateY: [0, 10, -10, 0],
          scaleX: [1, 1.05, 1, 0.95, 1],
          filter: "drop-shadow(0 0 20px rgba(255, 100, 0, 0.8))",
          transition: { duration: 0.6, repeat: 2 }
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: "drop-shadow(0 0 10px rgba(255, 165, 0, 0.6))"
        }}
      />
      
      {/* Flame Wing Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-red-500/20 to-yellow-500/30 rounded-lg"
        animate={{
          opacity: animate ? [0.2, 0.5, 0.2] : 0.2,
          scaleX: animate ? [1, 1.1, 1, 0.9, 1] : 1,
          scaleY: animate ? [1, 0.98, 1, 1.02, 1] : 1,
        }}
        whileHover={{
          opacity: [0.3, 0.7, 0.3],
          scaleX: [1, 1.15, 1, 0.85, 1],
          scaleY: [1, 0.95, 1, 1.05, 1],
          transition: { duration: 0.4, repeat: 4 }
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Enhanced floating particles */}
      {animate && (
        <>
          <motion.div
            className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-80"
            animate={{
              scale: [0, 1.2, 0],
              opacity: [0, 1, 0],
              y: [-5, -15, -5],
              x: [0, 5, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.3
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-br from-red-400 to-orange-400 rounded-full opacity-80"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [5, 15, 5],
              x: [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.2
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-70"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
              rotate: [0, 180, 360],
              x: [-10, 10, -10],
              y: [-10, 10, -10]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1.8
            }}
          />
        </>
      )}

      {/* Wing flutter effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-30"
        animate={{
          scaleX: [1, 1.1, 1, 0.9, 1],
          scaleY: [1, 0.95, 1, 1.05, 1]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent rounded-full" />
      </motion.div>
    </motion.div>
  );
};
