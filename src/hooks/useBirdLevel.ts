// Re-export from useOperatorRank for backward compatibility
// This file is deprecated - use useOperatorRank instead

import { useOperatorRank, DEFAULT_OPERATOR_RANKS, NextOperatorRank } from './useOperatorRank';

export interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  min_tasks: number;
  description: string;
  color: string;
  benefits: string[];
  animation_type: string;
  glow_effect: boolean;
  earningRate: number;
}

export interface NextBirdLevel extends BirdLevel {
  referrals_needed: number;
  points_needed: number;
  tasks_needed: number;
}

// Map operator ranks to bird levels for backward compatibility
const mapOperatorRankToBirdLevel = (rank: typeof DEFAULT_OPERATOR_RANKS[0]): BirdLevel => ({
  id: rank.rank_level,
  name: rank.name,
  icon: rank.emoji,
  emoji: rank.emoji,
  min_referrals: 0,
  min_points: rank.min_verified_executions * 10, // Approximate conversion
  min_tasks: rank.min_verified_executions,
  description: rank.description,
  color: rank.color,
  benefits: rank.benefits,
  animation_type: rank.rank_level >= 4 ? 'glow' : 'static',
  glow_effect: rank.rank_level >= 3,
  earningRate: 1 + (rank.rank_level - 1) * 0.05
});

const mapNextOperatorRankToNextBirdLevel = (nextRank: NextOperatorRank | null): NextBirdLevel | null => {
  if (!nextRank) return null;
  return {
    ...mapOperatorRankToBirdLevel(nextRank),
    referrals_needed: 0,
    points_needed: nextRank.executions_needed * 10,
    tasks_needed: nextRank.executions_needed
  };
};

export const useBirdLevel = () => {
  const { currentRank, nextRank, operatorStats, loading, error } = useOperatorRank();

  const currentBird = currentRank ? mapOperatorRankToBirdLevel(currentRank) : null;
  const nextBird = mapNextOperatorRankToNextBirdLevel(nextRank);

  const userStats = {
    referrals: 0,
    points: operatorStats.execution_credits_lifetime,
    tasksCompleted: operatorStats.verified_executions
  };

  return {
    currentBird,
    nextBird,
    userStats,
    loading,
    error
  };
};
