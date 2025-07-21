
import { useState, useEffect } from 'react';

export interface ExperienceTier {
  id: string;
  name: string;
  description: string;
  requiredTasks: number;
  requiredReferrals: number;
  requiredPoints: number;
  unlocks: string[];
}

const EXPERIENCE_TIERS: ExperienceTier[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Starting your journey',
    requiredTasks: 0,
    requiredReferrals: 0,
    requiredPoints: 0,
    unlocks: ['tasks', 'wallet', 'profile', 'support']
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Building momentum',
    requiredTasks: 5,
    requiredReferrals: 2,
    requiredPoints: 100,
    unlocks: ['referrals', 'community', 'stories', 'leaderboard']
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Mastering the platform',
    requiredTasks: 15,
    requiredReferrals: 5,
    requiredPoints: 500,
    unlocks: ['achievements', 'history', 'activity', 'notifications', 'search', 'rewards']
  }
];

export const useExperienceLevel = (
  referrals: number = 0, 
  points: number = 0, 
  tasksCompleted: number = 0
) => {
  const [level, setLevel] = useState(1);
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);
  const [currentTier, setCurrentTier] = useState<ExperienceTier>(EXPERIENCE_TIERS[0]);
  const [nextTier, setNextTier] = useState<ExperienceTier | null>(EXPERIENCE_TIERS[1]);

  useEffect(() => {
    // Calculate level based on total activity
    const totalActivity = referrals * 10 + points + tasksCompleted * 5;
    const calculatedLevel = Math.floor(totalActivity / 100) + 1;
    setLevel(calculatedLevel);

    // Find current tier
    let currentTierIndex = 0;
    for (let i = EXPERIENCE_TIERS.length - 1; i >= 0; i--) {
      const tier = EXPERIENCE_TIERS[i];
      if (tasksCompleted >= tier.requiredTasks && 
          referrals >= tier.requiredReferrals && 
          points >= tier.requiredPoints) {
        currentTierIndex = i;
        break;
      }
    }

    setCurrentTier(EXPERIENCE_TIERS[currentTierIndex]);
    setNextTier(currentTierIndex < EXPERIENCE_TIERS.length - 1 ? EXPERIENCE_TIERS[currentTierIndex + 1] : null);

    // Determine unlocked features based on current tier
    const features: string[] = [];
    for (let i = 0; i <= currentTierIndex; i++) {
      features.push(...EXPERIENCE_TIERS[i].unlocks);
    }
    setUnlockedFeatures(features);
  }, [referrals, points, tasksCompleted]);

  const isFeatureUnlocked = (feature: string) => {
    return unlockedFeatures.includes(feature);
  };

  const tasksToNextTier = nextTier ? Math.max(0, nextTier.requiredTasks - tasksCompleted) : 0;
  const referralsToNextTier = nextTier ? Math.max(0, nextTier.requiredReferrals - referrals) : 0;

  return {
    level,
    unlockedFeatures,
    isFeatureUnlocked,
    currentTier,
    nextTier,
    tasksToNextTier,
    referralsToNextTier
  };
};
