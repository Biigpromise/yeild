import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCw, 
  Star,
  Sparkles,
  Gift,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WHEEL_SEGMENTS = [
  { value: 5, color: 'from-blue-500 to-blue-600', label: '5' },
  { value: 10, color: 'from-green-500 to-green-600', label: '10' },
  { value: 15, color: 'from-yellow-500 to-yellow-600', label: '15' },
  { value: 20, color: 'from-orange-500 to-orange-600', label: '20' },
  { value: 25, color: 'from-pink-500 to-pink-600', label: '25' },
  { value: 50, color: 'from-purple-500 to-purple-600', label: '50' },
  { value: 5, color: 'from-cyan-500 to-cyan-600', label: '5' },
  { value: 100, color: 'from-red-500 to-red-600', label: '100' },
];

export const DailySpinWheel: React.FC = () => {
  const { user } = useAuth();
  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (user) {
      checkSpinStatus();
    }
  }, [user]);

  const checkSpinStatus = async () => {
    if (!user) return;
    
    try {
      // Check last spin
      const { data: transactions } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'spin_bonus')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastSpin = transactions?.[0];
      
      if (lastSpin) {
        const lastSpinDate = new Date(lastSpin.created_at);
        const today = new Date();
        const spunToday = lastSpinDate.toDateString() === today.toDateString();
        setCanSpin(!spunToday);
      } else {
        setCanSpin(true);
      }
    } catch (error) {
      console.error('Error checking spin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = async () => {
    if (!user || !canSpin || spinning) return;
    
    setSpinning(true);
    setShowResult(false);
    
    // Determine winning segment (weighted - lower values more likely)
    const weights = [20, 20, 15, 15, 10, 5, 10, 5]; // 100 total
    const random = Math.random() * 100;
    let cumulative = 0;
    let winningIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        winningIndex = i;
        break;
      }
    }
    
    const winningValue = WHEEL_SEGMENTS[winningIndex].value;
    
    // Calculate rotation (multiple full rotations + position)
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = (WHEEL_SEGMENTS.length - winningIndex) * segmentAngle - segmentAngle / 2;
    const newRotation = rotation + 1800 + targetAngle + Math.random() * (segmentAngle * 0.5);
    
    setRotation(newRotation);
    
    // Wait for spin animation
    setTimeout(async () => {
      setResult(winningValue);
      setShowResult(true);
      
      try {
        // Add points transaction
        const { error: transactionError } = await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            points: winningValue,
            transaction_type: 'spin_bonus',
            description: `Daily spin wheel bonus`
          });

        if (transactionError) throw transactionError;

        // Update user points
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        const newPoints = (profile?.points || 0) + winningValue;
        
        await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', user.id);

        setCanSpin(false);
        
        toast.success(`You won ${winningValue} points!`, {
          description: 'Come back tomorrow for another spin!'
        });
      } catch (error) {
        console.error('Error saving spin result:', error);
        toast.error('Failed to save spin result');
      }
      
      setSpinning(false);
    }, 4000);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-muted/20 rounded-full mx-auto w-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-background overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Lucky Spin</CardTitle>
              <p className="text-sm text-muted-foreground">
                Spin daily to win bonus points
              </p>
            </div>
          </div>
          {!canSpin && (
            <Badge variant="secondary" className="bg-muted/50">
              <Clock className="h-3 w-3 mr-1" />
              Tomorrow
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {/* Wheel */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
          {/* Pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-4 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 clip-triangle shadow-lg" 
                 style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
          </div>
          
          {/* Wheel Container */}
          <motion.div
            className="w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-primary/20"
            style={{ rotate: rotation }}
            animate={{ rotate: rotation }}
            transition={{ 
              duration: spinning ? 4 : 0, 
              ease: spinning ? [0.2, 0.8, 0.3, 1] : 'linear'
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {WHEEL_SEGMENTS.map((segment, index) => {
                const angle = (360 / WHEEL_SEGMENTS.length) * index;
                const nextAngle = (360 / WHEEL_SEGMENTS.length) * (index + 1);
                const startRad = (angle - 90) * (Math.PI / 180);
                const endRad = (nextAngle - 90) * (Math.PI / 180);
                
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                
                const textAngle = (angle + nextAngle) / 2;
                const textRad = (textAngle - 90) * (Math.PI / 180);
                const textX = 100 + 60 * Math.cos(textRad);
                const textY = 100 + 60 * Math.sin(textRad);
                
                const colors = [
                  '#3B82F6', '#22C55E', '#EAB308', '#F97316', 
                  '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'
                ];
                
                return (
                  <g key={index}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                      fill={colors[index]}
                      stroke="white"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="20" fill="white" stroke="#e5e7eb" strokeWidth="2" />
              <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#6b7280">
                SPIN
              </text>
            </svg>
          </motion.div>
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-4 text-center"
            >
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                +{result} Points!
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin Button */}
        <Button
          size="lg"
          className={`mt-6 ${
            canSpin && !spinning
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg'
              : ''
          }`}
          onClick={spinWheel}
          disabled={!canSpin || spinning}
        >
          {spinning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RotateCw className="h-5 w-5 mr-2" />
              </motion.div>
              Spinning...
            </>
          ) : canSpin ? (
            <>
              <Star className="h-5 w-5 mr-2" />
              Spin Now!
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 mr-2" />
              Come Back Tomorrow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
