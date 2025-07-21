
import { useState, useEffect } from 'react';

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

  return {
    level,
    unlockedFeatures,
    isFeatureUnlocked
  };
};
