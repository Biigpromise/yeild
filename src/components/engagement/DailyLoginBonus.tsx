import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  Flame, 
  Star,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STREAK_BONUSES = [10, 15, 20, 25, 30, 40, 50]; // Points for each day (7 days)

export const DailyLoginBonus: React.FC = () => {
  const { user } = useAuth();
  const [canClaim, setCanClaim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user) {
      checkLoginStatus();
    }
  }, [user]);

  const checkLoginStatus = async () => {
    if (!user) return;
    
    try {
      // Check last login bonus claim
      const { data: transactions } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'daily_bonus')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastClaim = transactions?.[0];
      
      if (lastClaim) {
        const lastClaimDate = new Date(lastClaim.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if claimed today
        const claimedToday = lastClaimDate.toDateString() === today.toDateString();
        setClaimed(claimedToday);
        setCanClaim(!claimedToday);
        
        // Calculate streak
        const claimedYesterday = lastClaimDate.toDateString() === yesterday.toDateString();
        if (claimedToday || claimedYesterday) {
          // Count consecutive days
          const { data: recentClaims } = await supabase
            .from('point_transactions')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('transaction_type', 'daily_bonus')
            .order('created_at', { ascending: false })
            .limit(7);

          let currentStreak = 0;
          if (recentClaims) {
            const now = new Date();
            for (let i = 0; i < recentClaims.length; i++) {
              const claimDate = new Date(recentClaims[i].created_at);
              const expectedDate = new Date(now);
              expectedDate.setDate(expectedDate.getDate() - i);
              
              if (claimDate.toDateString() === expectedDate.toDateString()) {
                currentStreak++;
              } else if (i === 0 && claimDate.toDateString() === yesterday.toDateString()) {
                // If not claimed today but claimed yesterday, count from yesterday
                currentStreak++;
              } else {
                break;
              }
            }
          }
          setStreak(currentStreak);
        } else {
          // Streak broken
          setStreak(0);
        }
      } else {
        // First time - can claim
        setCanClaim(true);
        setStreak(0);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimBonus = async () => {
    if (!user || !canClaim || claiming) return;
    
    setClaiming(true);
    try {
      const bonusPoints = STREAK_BONUSES[Math.min(streak, 6)];
      
      // Add points transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points: bonusPoints,
          transaction_type: 'daily_bonus',
          description: `Daily login bonus (Day ${streak + 1})`
        });

      if (transactionError) throw transactionError;

      // Update user points
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      const newPoints = (profile?.points || 0) + bonusPoints;
      
      await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id);

      setClaimed(true);
      setCanClaim(false);
      setStreak(prev => prev + 1);
      
      toast.success(`+${bonusPoints} points claimed!`, {
        description: `Day ${streak + 1} streak bonus`
      });
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast.error('Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return null;
  }

  const currentDayBonus = STREAK_BONUSES[Math.min(streak, 6)];
  const nextDayBonus = STREAK_BONUSES[Math.min(streak + 1, 6)];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden ${
        canClaim 
          ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-background shadow-lg shadow-yellow-500/10' 
          : 'border-border/60'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Gift Icon */}
            <motion.div
              animate={canClaim ? { 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: canClaim ? Infinity : 0,
                repeatDelay: 1
              }}
              className={`p-3 rounded-xl ${
                canClaim 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <Gift className="h-6 w-6" />
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">Daily Bonus</span>
                {streak > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600">
                    <Flame className="h-3 w-3 mr-1" />
                    {streak} day streak
                  </Badge>
                )}
              </div>
              
              {canClaim ? (
                <p className="text-sm text-muted-foreground">
                  Claim <span className="font-bold text-yellow-600">+{currentDayBonus} points</span> now!
                </p>
              ) : claimed ? (
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow for +{nextDayBonus} points
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Log in daily to earn bonus points
                </p>
              )}
            </div>

            {/* Action */}
            {canClaim ? (
              <Button
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                onClick={claimBonus}
                disabled={claiming}
              >
                {claiming ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-1" />
                    Claim
                  </>
                )}
              </Button>
            ) : claimed ? (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Claimed</span>
              </div>
            ) : null}
          </div>

          {/* Streak Progress */}
          {canClaim && (
            <div className="mt-4 pt-3 border-t border-border/40">
              <div className="flex justify-between gap-1">
                {STREAK_BONUSES.map((bonus, index) => (
                  <div
                    key={index}
                    className={`flex-1 text-center p-2 rounded-lg text-xs transition-all ${
                      index < streak 
                        ? 'bg-green-500/20 text-green-600' 
                        : index === streak 
                          ? 'bg-yellow-500/20 text-yellow-600 ring-2 ring-yellow-500/40' 
                          : 'bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold">Day {index + 1}</div>
                    <div className="text-[10px]">+{bonus}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
