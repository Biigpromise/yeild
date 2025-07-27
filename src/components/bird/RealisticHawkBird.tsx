import React from 'react';
import { motion } from 'framer-motion';

interface RealisticHawkBirdProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export const RealisticHawkBird: React.FC<RealisticHawkBirdProps> = ({
  size = 'md',
  animate = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl'
  };

  const hawkEmoji = '🦅';

  return (
    <motion.div
      className={`relative inline-block ${sizeClasses[size]} ${className}`}
      animate={animate ? {
        y: [0, -4, 0],
      } : {}}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.1,
        rotate: [0, -2, 2, 0],
        transition: { duration: 0.3 }
      }}
    >
      {/* Sharp hunting aura */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 69, 19, 0.2) 0%, rgba(160, 82, 45, 0.1) 50%, transparent 70%)',
          filter: 'blur(8px)'
        }}
        animate={animate ? {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.4,
          opacity: 0.9
        }}
      />

      {/* Hunting precision ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ 
          borderColor: 'rgba(139, 69, 19, 0.4)',
          borderStyle: 'dashed'
        }}
        animate={animate ? {
          rotate: 360,
          scale: [1, 1.1, 1]
        } : {}}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Hawk symbol with earth-toned gradient */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #8B4513, #A0522D, #8B4513)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))'
        }}
        animate={animate ? {
          textShadow: [
            '0 0 10px rgba(139, 69, 19, 0.5)',
            '0 0 20px rgba(160, 82, 45, 0.7)',
            '0 0 10px rgba(139, 69, 19, 0.5)'
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.05,
          filter: 'drop-shadow(0 4px 8px rgba(139, 69, 19, 0.5))'
        }}
      >
        {hawkEmoji}
      </motion.div>

      {/* Floating feathers */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-600 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: `${80 + i * 5}%`,
          }}
          animate={animate ? {
            y: [0, -10, 0],
            x: [0, 5, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [0.8, 1, 0.8]
          } : {}}
          transition={{
            duration: 2.5 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}

      {/* Quick strike effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 69, 19, 0.1) 0%, transparent 70%)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{
          opacity: [0, 0.6, 0],
          scale: [0.8, 1.2, 1.4],
          transition: { duration: 0.4, ease: "easeOut" }
        }}
      />
    </motion.div>
  );
};