import { useMemo } from 'react';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExperienceTier {
  level: ExperienceLevel;
  name: string;
  description: string;
  minTasks: number;
  minReferrals: number;
  features: string[];
}

export const EXPERIENCE_TIERS: ExperienceTier[] = [
  {
    level: 'beginner',
    name: 'Getting Started',
    description: 'Focus on completing your first tasks and earning points',
    minTasks: 0,
    minReferrals: 0,
    features: ['tasks', 'profile', 'wallet', 'support', 'referrals']
  },
  {
    level: 'intermediate', 
    name: 'Building Momentum',
    description: 'Unlock social features and start building your network',
    minTasks: 1,
    minReferrals: 3,
    features: ['tasks', 'profile', 'wallet', 'support', 'referrals', 'community', 'stories', 'leaderboard']
  },
  {
    level: 'advanced',
    name: 'Expert User',
    description: 'Access all advanced features and analytics',
    minTasks: 10,
    minReferrals: 0,
    features: ['tasks', 'profile', 'wallet', 'support', 'referrals', 'community', 'stories', 'leaderboard', 'achievements', 'history', 'activity', 'notifications', 'search', 'rewards']
  }
];

export interface UseExperienceLevelResult {
  currentTier: ExperienceTier;
  nextTier: ExperienceTier | null;
  tasksToNextTier: number;
  referralsToNextTier: number;
  progress: number;
  isFeatureUnlocked: (featureId: string) => boolean;
  getUnlockedFeatures: () => string[];
  getLockedFeatures: () => string[];
  justUnlockedFeatures: string[];
}

export const useExperienceLevel = (
  tasksCompleted: number = 0, 
  previousTasksCompleted: number = 0,
  referralsCount: number = 0
): UseExperienceLevelResult => {
  return useMemo(() => {
    // Find current tier - user must meet BOTH tasks and referrals requirements
    // Always ensure users have at least beginner tier access
    const currentTier = [...EXPERIENCE_TIERS]
      .reverse()
      .find(tier => tasksCompleted >= tier.minTasks && referralsCount >= tier.minReferrals) || EXPERIENCE_TIERS[0];
    
    // Find next tier
    const nextTier = EXPERIENCE_TIERS.find(tier => 
      tasksCompleted < tier.minTasks || referralsCount < tier.minReferrals
    ) || null;
    
    // Calculate requirements to next tier
    const tasksToNextTier = nextTier ? Math.max(0, nextTier.minTasks - tasksCompleted) : 0;
    const referralsToNextTier = nextTier ? Math.max(0, nextTier.minReferrals - referralsCount) : 0;
    
    // Calculate progress to next tier (based on both requirements)
    let progress = 100;
    if (nextTier) {
      const taskProgress = nextTier.minTasks > 0 ? (tasksCompleted / nextTier.minTasks) * 100 : 100;
      const referralProgress = nextTier.minReferrals > 0 ? (referralsCount / nextTier.minReferrals) * 100 : 100;
      progress = Math.min(taskProgress, referralProgress);
    }
    
    // Helper functions
    const isFeatureUnlocked = (featureId: string): boolean => {
      return currentTier.features.includes(featureId);
    };
    
    const getUnlockedFeatures = (): string[] => {
      return currentTier.features;
    };
    
    const getLockedFeatures = (): string[] => {
      const allFeatures = EXPERIENCE_TIERS[EXPERIENCE_TIERS.length - 1].features;
      return allFeatures.filter(feature => !currentTier.features.includes(feature));
    };
    
    // Check for newly unlocked features (comparing with previous task count)
    const previousTier = [...EXPERIENCE_TIERS]
      .reverse()
      .find(tier => previousTasksCompleted >= tier.minTasks && referralsCount >= tier.minReferrals) || EXPERIENCE_TIERS[0];
    
    const justUnlockedFeatures = currentTier.features.filter(
      feature => !previousTier.features.includes(feature)
    );
    
    return {
      currentTier,
      nextTier,
      tasksToNextTier,
      referralsToNextTier,
      progress: Math.min(100, Math.max(0, progress)),
      isFeatureUnlocked,
      getUnlockedFeatures,
      getLockedFeatures,
      justUnlockedFeatures
    };
  }, [tasksCompleted, previousTasksCompleted, referralsCount]);
};