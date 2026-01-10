import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users, Trophy, Target, Zap, AlertCircle, Shield, Star } from 'lucide-react';
import { useOperatorRank } from '@/hooks/useOperatorRank';

export const OperatorRankDisplay: React.FC = () => {
  const { currentRank, nextRank, operatorStats, loading, error } = useOperatorRank();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-16 bg-muted rounded-full w-16 mx-auto"></div>
            <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress to next rank
  const progressToNext = nextRank ? (() => {
    const execsNeeded = nextRank.min_verified_executions - currentRank.min_verified_executions;
    const currentExecs = operatorStats.verified_executions - currentRank.min_verified_executions;
    return Math.min(100, Math.max(0, (currentExecs / Math.max(1, execsNeeded)) * 100));
  })() : 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Operator Rank</span>
          </div>
          <Crown className="h-5 w-5 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Rank Display */}
        <div className="flex flex-col items-center">
          <motion.div
            className="relative mb-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-primary/30 bg-primary/10"
            >
              {currentRank.emoji}
            </div>
          </motion.div>

          <Badge className="mb-2 px-4 py-1 text-sm font-semibold bg-primary text-primary-foreground">
            {currentRank.name} Operator
          </Badge>
          
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {currentRank.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Zap className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{operatorStats.execution_credits_balance}</div>
            <div className="text-xs text-muted-foreground">Balance</div>
          </div>
          
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Target className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{operatorStats.verified_executions}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{operatorStats.execution_credits_lifetime}</div>
            <div className="text-xs text-muted-foreground">Lifetime</div>
          </div>
        </div>

        {/* Progress to Next Rank */}
        {nextRank && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Next: {nextRank.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressToNext)}%
              </span>
            </div>
            
            <Progress value={progressToNext} className="h-2" />
            
            <div className="text-xs text-muted-foreground text-center">
              Need: {Math.max(0, nextRank.min_verified_executions - operatorStats.verified_executions)} more verified executions
            </div>
          </div>
        )}

        {!nextRank && (
          <div className="text-center py-3">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-sm text-yellow-600 font-semibold">Max Rank Achieved!</div>
          </div>
        )}

        {/* Access Level Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Star className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Rank Level {currentRank.rank_level} • {currentRank.allowed_template_codes.length} Order Types
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
