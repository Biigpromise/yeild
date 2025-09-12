import { BirdLevel } from '@/hooks/useBirdLevel';
import { supabase } from '@/integrations/supabase/client';

export interface BirdPointCalculationFactors {
  basePoints: number;
  difficulty: string;
  taskCategory: string;
  timeSpent?: number;
  qualityScore?: number;
  userId: string;
}

export interface BirdPointCalculationResult {
  finalPoints: number;
  breakdown: {
    basePoints: number;
    birdLevelBonus: number;
    birdBonusPercentage: number;
    difficultyMultiplier: number;
    categoryBonus: number;
    qualityBonus: number;
    timeBonus: number;
    totalMultiplier: number;
  };
  explanation: string[];
  birdLevel: string;
}

class BirdPointCalculationService {
  // Bird level bonuses - these are BONUSES, not penalties!
  private getBirdLevelBonus(birdName: string): number {
    const bonuses = {
      'Dove': 0.0,      // 0% bonus (base level)
      'Sparrow': 0.10,   // 10% bonus 
      'Hawk': 0.15,     // 15% bonus
      'Eagle': 0.20,    // 20% bonus
      'Falcon': 0.25,   // 25% bonus  
      'Phoenix': 0.30   // 30% bonus (highest level)
    };
    
    return bonuses[birdName as keyof typeof bonuses] || 0.0;
  }

  // Difficulty multipliers (fair for all levels)
  private difficultyMultipliers = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.2
  };

  // Category bonuses for task variety
  private getCategoryBonus(taskCategory: string): number {
    const categoryBonuses = {
      'survey': 1.0,
      'app_testing': 1.1,
      'content_creation': 1.2,
      'social_media': 1.0,
      'research': 1.1,
      'marketing': 1.1
    };

    return categoryBonuses[taskCategory as keyof typeof categoryBonuses] || 1.0;
  }

  // Quality bonus based on admin review
  private calculateQualityBonus(qualityScore?: number): number {
    if (!qualityScore) return 1.0;
    
    if (qualityScore >= 90) return 1.3; // 30% bonus for excellent work
    if (qualityScore >= 80) return 1.2; // 20% bonus for good work
    if (qualityScore >= 70) return 1.1; // 10% bonus for decent work
    if (qualityScore >= 60) return 1.0; // No bonus/penalty
    if (qualityScore >= 50) return 0.9; // 10% reduction for poor work
    return 0.8; // 20% reduction for very poor work
  }

  // Time bonus for efficient completion
  private calculateTimeBonus(timeSpent?: number, estimatedTime: number = 30): number {
    if (!timeSpent) return 1.0;

    const ratio = timeSpent / estimatedTime;
    
    if (ratio <= 0.7) return 1.15; // 15% bonus for quick completion
    if (ratio <= 1.0) return 1.05; // 5% bonus for on-time completion
    if (ratio <= 1.5) return 1.0;  // No bonus/penalty
    return 0.95; // 5% reduction for slow completion
  }

  private async getUserBirdLevel(userId: string): Promise<{ name: string; level: number }> {
    try {
      // Get user's current stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_referrals_count, points')
        .eq('id', userId)
        .single();

      const referrals = profile?.active_referrals_count || 0;
      const points = profile?.points || 0;

      // Determine bird level based on referrals and points
      if (referrals >= 500) return { name: 'Phoenix', level: 6 };
      if (referrals >= 100) return { name: 'Falcon', level: 5 };
      if (referrals >= 50) return { name: 'Eagle', level: 4 };
      if (referrals >= 20) return { name: 'Hawk', level: 3 };
      if (referrals >= 5) return { name: 'Sparrow', level: 2 };
      return { name: 'Dove', level: 1 };

    } catch (error) {
      console.error('Error getting user bird level:', error);
      return { name: 'Dove', level: 1 }; // Fallback to base level
    }
  }

  async calculatePoints(factors: BirdPointCalculationFactors): Promise<BirdPointCalculationResult> {
    const {
      basePoints,
      difficulty,
      taskCategory,
      timeSpent,
      qualityScore,
      userId
    } = factors;

    // Get user's bird level
    const birdLevel = await this.getUserBirdLevel(userId);
    
    // Calculate all multipliers
    const difficultyMultiplier = this.difficultyMultipliers[difficulty as keyof typeof this.difficultyMultipliers] || 1.0;
    const categoryBonus = this.getCategoryBonus(taskCategory);
    const qualityBonus = this.calculateQualityBonus(qualityScore);
    const timeBonus = this.calculateTimeBonus(timeSpent);
    
    // Calculate bird level bonus (this is ADDITIVE, not a penalty!)
    const birdBonusPercentage = this.getBirdLevelBonus(birdLevel.name);
    const birdLevelBonus = Math.floor(basePoints * birdBonusPercentage);
    
    // Calculate total multiplier for base points
    const totalMultiplier = difficultyMultiplier * categoryBonus * qualityBonus * timeBonus;
    
    // Calculate final points: (base points × multipliers) + bird level bonus
    const multipliedBasePoints = Math.floor(basePoints * totalMultiplier);
    const finalPoints = multipliedBasePoints + birdLevelBonus;

    // Generate explanation
    const explanation: string[] = [];
    explanation.push(`Base points: ${basePoints}`);
    
    if (difficultyMultiplier !== 1.0) {
      explanation.push(`Difficulty (${difficulty}): ×${difficultyMultiplier}`);
    }
    
    if (categoryBonus !== 1.0) {
      explanation.push(`Category (${taskCategory}): ×${categoryBonus.toFixed(2)}`);
    }
    
    if (qualityBonus !== 1.0) {
      explanation.push(`Quality bonus: ×${qualityBonus}`);
    }
    
    if (timeBonus !== 1.0) {
      explanation.push(`Time bonus: ×${timeBonus.toFixed(2)}`);
    }
    
    explanation.push(`Subtotal: ${basePoints} × ${totalMultiplier.toFixed(2)} = ${multipliedBasePoints}`);
    
    if (birdLevelBonus > 0) {
      explanation.push(`${birdLevel.name} level bonus (+${Math.round(birdBonusPercentage * 100)}%): +${birdLevelBonus}`);
    }
    
    explanation.push(`Final points: ${multipliedBasePoints} + ${birdLevelBonus} = ${finalPoints}`);

    return {
      finalPoints,
      breakdown: {
        basePoints,
        birdLevelBonus,
        birdBonusPercentage: birdBonusPercentage * 100,
        difficultyMultiplier,
        categoryBonus,
        qualityBonus,
        timeBonus,
        totalMultiplier
      },
      explanation,
      birdLevel: birdLevel.name
    };
  }

  // Helper method to preview points for different bird levels
  async previewPointsForBirdLevels(factors: Omit<BirdPointCalculationFactors, 'userId'>): Promise<{
    [key: string]: number;
  }> {
    const birdLevels = ['Dove', 'Sparrow', 'Hawk', 'Eagle', 'Falcon', 'Phoenix'];
    const preview: { [key: string]: number } = {};
    
    for (const bird of birdLevels) {
      const birdBonusPercentage = this.getBirdLevelBonus(bird);
      const birdLevelBonus = Math.floor(factors.basePoints * birdBonusPercentage);
      
      const difficultyMultiplier = this.difficultyMultipliers[factors.difficulty as keyof typeof this.difficultyMultipliers] || 1.0;
      const categoryBonus = this.getCategoryBonus(factors.taskCategory);
      const qualityBonus = this.calculateQualityBonus(factors.qualityScore);
      const timeBonus = this.calculateTimeBonus(factors.timeSpent);
      
      const totalMultiplier = difficultyMultiplier * categoryBonus * qualityBonus * timeBonus;
      const multipliedBasePoints = Math.floor(factors.basePoints * totalMultiplier);
      
      preview[bird] = multipliedBasePoints + birdLevelBonus;
    }
    
    return preview;
  }
}

export const birdPointCalculationService = new BirdPointCalculationService();
export type { BirdPointCalculationFactors as BirdFactors, BirdPointCalculationResult as BirdResult };