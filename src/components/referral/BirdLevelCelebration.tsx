import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Trophy, Crown } from 'lucide-react';

interface BirdLevelCelebrationProps {
  newLevel: {
    name: string;
    emoji: string;
    color: string;
    benefits: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BirdLevelCelebration: React.FC<BirdLevelCelebrationProps> = ({
  newLevel,
  isOpen,
  onClose
}) => {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen && newLevel) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, newLevel]);

  if (!newLevel) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* Fireworks Effect */}
          {showFireworks && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`rocket-${i}`}
                  className="absolute text-2xl"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    opacity: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 50}vh`,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 1,
                  }}
                >
                  🚀
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative max-w-md w-full"
          >
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-yellow-500/50 shadow-2xl">
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Background sparkles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="text-6xl mb-4">{newLevel.emoji}</div>
                  <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-white">
                    🎉 Congratulations! 🎉
                  </h2>
                  
                  <div className="space-y-2">
                    <p className="text-lg text-yellow-400">
                      You've reached
                    </p>
                    <Badge 
                      className="text-lg px-4 py-2"
                      style={{ 
                        backgroundColor: newLevel.color + '20',
                        color: newLevel.color,
                        borderColor: newLevel.color
                      }}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      {newLevel.name} Level
                    </Badge>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">
                      New Benefits Unlocked:
                    </h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {newLevel.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={onClose}
                    className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    Continue Your Journey! 🚀
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};