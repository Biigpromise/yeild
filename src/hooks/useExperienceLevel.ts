import { useMemo } from 'react';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExperienceTier {
  level: ExperienceLevel;
  name: string;
  description: string;
  minTasks: number;
  features: string[];
}

export const EXPERIENCE_TIERS: ExperienceTier[] = [
  {
    level: 'beginner',
    name: 'Getting Started',
    description: 'Focus on completing your first tasks and earning points',
    minTasks: 0,
    features: ['tasks', 'profile', 'wallet', 'support']
  },
  {
    level: 'intermediate', 
    name: 'Building Momentum',
    description: 'Unlock social features and start building your network',
    minTasks: 3,
    features: ['tasks', 'profile', 'wallet', 'support', 'community', 'stories', 'referrals', 'leaderboard']
  },
  {
    level: 'advanced',
    name: 'Expert User',
    description: 'Access all advanced features and analytics',
    minTasks: 10,
    features: ['tasks', 'profile', 'wallet', 'support', 'community', 'stories', 'referrals', 'leaderboard', 'achievements', 'history', 'activity', 'notifications', 'search', 'rewards']
  }
];

export interface UseExperienceLevelResult {
  currentTier: ExperienceTier;
  nextTier: ExperienceTier | null;
  tasksToNextTier: number;
  progress: number;
  isFeatureUnlocked: (featureId: string) => boolean;
  getUnlockedFeatures: () => string[];
  getLockedFeatures: () => string[];
  justUnlockedFeatures: string[];
}

export const useExperienceLevel = (tasksCompleted: number = 0, previousTasksCompleted: number = 0): UseExperienceLevelResult => {
  return useMemo(() => {
    // Find current tier
    const currentTier = [...EXPERIENCE_TIERS]
      .reverse()
      .find(tier => tasksCompleted >= tier.minTasks) || EXPERIENCE_TIERS[0];
    
    // Find next tier
    const nextTier = EXPERIENCE_TIERS.find(tier => tier.minTasks > tasksCompleted) || null;
    
    // Calculate progress to next tier
    const tasksToNextTier = nextTier ? nextTier.minTasks - tasksCompleted : 0;
    const progressRange = nextTier ? nextTier.minTasks - currentTier.minTasks : 1;
    const currentProgress = tasksCompleted - currentTier.minTasks;
    const progress = nextTier ? (currentProgress / progressRange) * 100 : 100;
    
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
      .find(tier => previousTasksCompleted >= tier.minTasks) || EXPERIENCE_TIERS[0];
    
    const justUnlockedFeatures = currentTier.features.filter(
      feature => !previousTier.features.includes(feature)
    );
    
    return {
      currentTier,
      nextTier,
      tasksToNextTier,
      progress: Math.min(100, Math.max(0, progress)),
      isFeatureUnlocked,
      getUnlockedFeatures,
      getLockedFeatures,
      justUnlockedFeatures
    };
  }, [tasksCompleted, previousTasksCompleted]);
};