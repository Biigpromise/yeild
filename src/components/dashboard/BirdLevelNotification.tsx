import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Gem, Flame, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BirdLevelNotificationProps {
  newLevel: {
    name: string;
    icon: string;
    color: string;
    description: string;
    benefits: string[];
  };
  show: boolean;
  onClose: () => void;
}

const iconMap = {
  crown: Crown,
  zap: Zap,
  gem: Gem,
  flame: Flame,
};

export const BirdLevelNotification: React.FC<BirdLevelNotificationProps> = ({
  newLevel,
  show,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const IconComponent = iconMap[newLevel.icon as keyof typeof iconMap] || Crown;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="mx-4 max-w-md"
          >
            <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg border-2 border-purple-500/30 shadow-xl">
              <CardContent className="p-6 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="absolute top-2 right-2 text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>

                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="mb-4"
                >
                  <div 
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg"
                    style={{ 
                      backgroundColor: newLevel.color + '30',
                      border: `3px solid ${newLevel.color}`,
                      boxShadow: `0 0 30px ${newLevel.color}50`
                    }}
                  >
                    <IconComponent 
                      className="w-10 h-10" 
                      style={{ color: newLevel.color }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    🎉 Bird Level Up! 🎉
                  </h2>
                  <Badge 
                    className="text-lg px-4 py-2 mb-3 text-white font-bold"
                    style={{ backgroundColor: newLevel.color }}
                  >
                    {newLevel.name} YEILDER
                  </Badge>
                  <p className="text-gray-300 mb-4">{newLevel.description}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/10 rounded-lg p-4 mb-4"
                >
                  <h3 className="text-white font-semibold mb-2">New Benefits Unlocked:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {newLevel.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-green-400">✓</span>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <Button
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(onClose, 300);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
                  >
                    Awesome! 🚀
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};