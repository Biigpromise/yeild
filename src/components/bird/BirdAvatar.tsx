import React from 'react';
import { motion } from 'framer-motion';
import { RealisticPhoenixBird } from './RealisticPhoenixBird';

interface BirdAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export const BirdAvatar: React.FC<BirdAvatarProps> = ({ 
  name, 
  size = 'md', 
  animated = true,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-2xl';
      case 'md': return 'w-12 h-12 text-4xl';
      case 'lg': return 'w-16 h-16 text-6xl';
      case 'xl': return 'w-24 h-24 text-8xl';
      default: return 'w-12 h-12 text-4xl';
    }
  };

  const getBirdComponent = (birdName: string) => {
    const lowerName = birdName.toLowerCase();
    
    if (lowerName === 'phoenix') {
      return <RealisticPhoenixBird size={size} animate={animated} className={className} />;
    }
    
    // Real bird icons/emojis for other birds
    const birdIcons = {
      dove: '🕊️',
      sparrow: '🐦',
      robin: '🐦',
      cardinal: '🐦',
      bluebird: '🐦',
      hawk: '🦅',
      eagle: '🦅',
      falcon: '🦅',
      owl: '🦉',
      peacock: '🦚',
      flamingo: '🦩',
      penguin: '🐧',
      parrot: '🦜',
      toucan: '🦜',
      swan: '🦢',
      default: '🐦'
    };

    const icon = birdIcons[lowerName] || birdIcons.default;
    
    return (
      <motion.div 
        className={`${getSizeClasses()} flex items-center justify-center ${className}`}
        animate={animated ? {
          y: [0, -2, 0],
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={animated ? {
          scale: 1.2,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.3 }
        } : {}}
      >
        <span className="drop-shadow-lg">{icon}</span>
      </motion.div>
    );
  };

  return getBirdComponent(name);
};