
import { useState, useEffect } from 'react';

export interface ExperienceTier {
  id: number;
  name: string;
  description: string;
  minLevel: number;
  features: string[];
  minTasks: number;
  minReferrals: number;
}

const experienceTiers: ExperienceTier[] = [
  {
    id: 1,
    name: 'Starter',
    description: 'Welcome to your journey!',
    minLevel: 1,
    features: ['basic_tasks'],
    minTasks: 0,
    minReferrals: 0
  },
  {
    id: 2,
    name: 'Explorer',
    description: 'Unlock advanced features',
    minLevel: 2,
    features: ['basic_tasks', 'advanced_tasks'],
    minTasks: 5,
    minReferrals: 1
  },
  {
    id: 3,
    name: 'Networker',
    description: 'Master of connections',
    minLevel: 3,
    features: ['basic_tasks', 'advanced_tasks', 'referral_bonuses'],
    minTasks: 10,
    minReferrals: 3
  },
  {
    id: 5,
    name: 'Elite',
    description: 'Premium tier access',
    minLevel: 5,
    features: ['basic_tasks', 'advanced_tasks', 'referral_bonuses', 'premium_rewards'],
    minTasks: 25,
    minReferrals: 10
  }
];

export const useExperienceLevel = (
  referrals: number = 0, 
  points: number = 0, 
  tasksCompleted: number = 0
) => {
  const [level, setLevel] = useState(1);
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);

  useEffect(() => {
    // Calculate level based on total activity
    const totalActivity = referrals * 10 + points + tasksCompleted * 5;
    const calculatedLevel = Math.floor(totalActivity / 100) + 1;
    setLevel(calculatedLevel);

    // Determine unlocked features based on level
    const features = [];
    if (calculatedLevel >= 2) features.push('advanced_tasks');
    if (calculatedLevel >= 3) features.push('referral_bonuses');
    if (calculatedLevel >= 5) features.push('premium_rewards');
    
    setUnlockedFeatures(features);
  }, [referrals, points, tasksCompleted]);

  const isFeatureUnlocked = (feature: string) => {
    return unlockedFeatures.includes(feature);
  };

  // Find current and next tier
  const currentTier = experienceTiers.find(tier => tier.minLevel <= level) || experienceTiers[0];
  const nextTier = experienceTiers.find(tier => tier.minLevel > level) || null;

  // Calculate requirements for next tier
  const tasksToNextTier = nextTier ? Math.max(0, nextTier.minTasks - tasksCompleted) : 0;
  const referralsToNextTier = nextTier ? Math.max(0, nextTier.minReferrals - referrals) : 0;

  return {
    level,
    unlockedFeatures,
    isFeatureUnlocked,
    nextTier,
    tasksToNextTier,
    referralsToNextTier,
    currentTier
  };
};
