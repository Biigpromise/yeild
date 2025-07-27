import React from 'react';
import { motion } from 'framer-motion';

interface RealisticFalconBirdProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export const RealisticFalconBird: React.FC<RealisticFalconBirdProps> = ({
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

  const falconEmoji = '🦅';

  return (
    <motion.div
      className={`relative inline-block ${sizeClasses[size]} ${className}`}
      animate={animate ? {
        y: [0, -3, 0],
        x: [0, 1, 0]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.12,
        x: [0, 3, -3, 0],
        transition: { duration: 0.3 }
      }}
    >
      {/* Speed aura */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(70, 130, 180, 0.25) 0%, rgba(100, 149, 237, 0.15) 50%, transparent 70%)',
          filter: 'blur(10px)'
        }}
        animate={animate ? {
          scale: [1, 1.25, 1],
          opacity: [0.5, 0.9, 0.5]
        } : {}}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.4,
          opacity: 1
        }}
      />

      {/* Aerodynamic rings */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{ 
            borderColor: `rgba(70, 130, 180, ${0.3 - i * 0.1})`,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          animate={animate ? {
            rotate: 360,
            scale: [1 + i * 0.1, 1.2 + i * 0.1, 1 + i * 0.1]
          } : {}}
          transition={{
            rotate: { duration: 3 - i * 0.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }
          }}
        />
      ))}

      {/* Falcon symbol with steel-blue gradient */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #4682B4, #6495ED, #4169E1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 2px 5px rgba(70, 130, 180, 0.4))'
        }}
        animate={animate ? {
          textShadow: [
            '0 0 12px rgba(70, 130, 180, 0.6)',
            '0 0 20px rgba(100, 149, 237, 0.8)',
            '0 0 12px rgba(70, 130, 180, 0.6)'
          ]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.08,
          filter: 'drop-shadow(0 4px 10px rgba(70, 130, 180, 0.6))'
        }}
      >
        {falconEmoji}
      </motion.div>

      {/* Speed trails */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-0.5 bg-gradient-to-r from-blue-400 to-transparent rounded-full"
          style={{
            top: `${40 + i * 8}%`,
            left: `${-10 - i * 5}%`,
            transform: `rotate(${-20 + i * 5}deg)`
          }}
          animate={animate ? {
            x: [0, 20, 0],
            opacity: [0.4, 0.8, 0.4],
            scaleX: [0.6, 1.4, 0.6]
          } : {}}
          transition={{
            duration: 1.2 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1
          }}
        />
      ))}

      {/* Rapid dart effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(ellipse 150% 80% at 50% 50%, rgba(70, 130, 180, 0.2) 0%, transparent 70%)'
        }}
        initial={{ opacity: 0, scaleX: 0.8 }}
        whileHover={{
          opacity: [0, 0.7, 0],
          scaleX: [0.8, 1.5, 2],
          transition: { duration: 0.4, ease: "easeOut" }
        }}
      />

      {/* Speed indicators */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-300 rounded-full"
          style={{
            top: `${30 + i * 40}%`,
            right: `${-5 - i * 3}%`,
          }}
          animate={animate ? {
            x: [0, -15, 0],
            opacity: [0.6, 1, 0.6],
            scale: [0.8, 1.2, 0.8]
          } : {}}
          transition={{
            duration: 0.8 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1
          }}
        />
      ))}
    </motion.div>
  );
};