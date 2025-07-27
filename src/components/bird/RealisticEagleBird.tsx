import React from 'react';
import { motion } from 'framer-motion';

interface RealisticEagleBirdProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export const RealisticEagleBird: React.FC<RealisticEagleBirdProps> = ({
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

  const eagleEmoji = '🦅';

  return (
    <motion.div
      className={`relative inline-block ${sizeClasses[size]} ${className}`}
      animate={animate ? {
        y: [0, -6, 0],
      } : {}}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.15,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
    >
      {/* Majestic golden aura */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, rgba(255, 215, 0, 0.2) 50%, transparent 70%)',
          filter: 'blur(12px)'
        }}
        animate={animate ? {
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.5,
          opacity: 1
        }}
      />

      {/* Royal circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ 
          borderColor: 'rgba(218, 165, 32, 0.6)',
          borderStyle: 'solid'
        }}
        animate={animate ? {
          rotate: -360,
          scale: [1, 1.15, 1]
        } : {}}
        transition={{
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Eagle symbol with golden gradient */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #DAA520, #FFD700, #B8860B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 3px 6px rgba(218, 165, 32, 0.4))'
        }}
        animate={animate ? {
          textShadow: [
            '0 0 15px rgba(218, 165, 32, 0.6)',
            '0 0 25px rgba(255, 215, 0, 0.8)',
            '0 0 15px rgba(218, 165, 32, 0.6)'
          ]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.1,
          filter: 'drop-shadow(0 6px 12px rgba(218, 165, 32, 0.6))'
        }}
      >
        {eagleEmoji}
      </motion.div>

      {/* Soaring wind currents */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-0.5 bg-gradient-to-r from-amber-400 to-transparent rounded-full"
          style={{
            top: `${15 + i * 20}%`,
            left: `${90 + i * 2}%`,
            transform: `rotate(${-15 + i * 10}deg)`
          }}
          animate={animate ? {
            x: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3],
            scaleX: [0.8, 1.2, 0.8]
          } : {}}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4
          }}
        />
      ))}

      {/* Majestic power wave on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(218, 165, 32, 0.15) 0%, transparent 80%)'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileHover={{
          opacity: [0, 0.8, 0],
          scale: [0.9, 1.3, 1.6],
          transition: { duration: 0.6, ease: "easeOut" }
        }}
      />

      {/* Crown effect */}
      <motion.div
        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2"
        style={{
          background: 'radial-gradient(circle, #FFD700, #DAA520)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
        }}
        animate={animate ? {
          scale: [0.8, 1.1, 0.8],
          opacity: [0.5, 1, 0.5]
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};