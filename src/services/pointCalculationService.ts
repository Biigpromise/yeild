
interface PointCalculationFactors {
  basePoints: number;
  difficulty: string;
  userLevel: number;
  tasksCompletedToday: number;
  totalTasksCompleted: number;
  taskCategory: string;
  timeSpent?: number; // in minutes
  qualityScore?: number; // 0-100 based on admin review
}

interface PointCalculationResult {
  finalPoints: number;
  breakdown: {
    basePoints: number;
    difficultyMultiplier: number;
    levelPenalty: number;
    dailyTasksPenalty: number;
    categoryBonus: number;
    qualityBonus: number;
    timeBonus: number;
    totalMultiplier: number;
  };
  explanation: string[];
}

class PointCalculationService {
  // Difficulty multipliers (reduced from standard)
  private difficultyMultipliers = {
    easy: 0.6,    // 40% reduction
    medium: 0.8,  // 20% reduction  
    hard: 1.0     // No reduction
  };

  // Level penalty - higher levels get fewer points
  private calculateLevelPenalty(userLevel: number): number {
    // Exponential penalty: Level 1 = 100%, Level 5 = 50%, Level 10 = 25%
    return Math.max(0.25, 1 - (userLevel - 1) * 0.1);
  }

  // Daily tasks penalty - diminishing returns
  private calculateDailyTasksPenalty(tasksCompletedToday: number): number {
    if (tasksCompletedToday <= 3) return 1.0;
    if (tasksCompletedToday <= 6) return 0.8;
    if (tasksCompletedToday <= 10) return 0.6;
    return 0.4; // Maximum 60% reduction
  }

  // Category bonuses for variety
  private getCategoryBonus(taskCategory: string, totalTasksCompleted: number): number {
    // Bonus for trying different types of tasks
    const varietyBonus = Math.min(0.2, totalTasksCompleted * 0.001);
    
    const categoryBonuses = {
      'survey': 1.0,
      'app_testing': 1.1,
      'content_creation': 1.2,
      'social_media': 0.9,
      'research': 1.1
    };

    const baseBonus = categoryBonuses[taskCategory as keyof typeof categoryBonuses] || 1.0;
    return baseBonus + varietyBonus;
  }

  // Quality bonus based on admin review
  private calculateQualityBonus(qualityScore?: number): number {
    if (!qualityScore) return 1.0;
    
    if (qualityScore >= 90) return 1.3; // 30% bonus for excellent work
    if (qualityScore >= 80) return 1.2; // 20% bonus for good work
    if (qualityScore >= 70) return 1.1; // 10% bonus for decent work
    if (qualityScore >= 60) return 1.0; // No bonus/penalty
    if (qualityScore >= 50) return 0.8; // 20% penalty for poor work
    return 0.6; // 40% penalty for very poor work
  }

  // Time bonus for quick completion
  private calculateTimeBonus(timeSpent?: number, estimatedTime?: string): number {
    if (!timeSpent || !estimatedTime) return 1.0;

    // Parse estimated time (assuming format like "5 minutes", "1 hour")
    const estimatedMinutes = this.parseTimeToMinutes(estimatedTime);
    if (!estimatedMinutes) return 1.0;

    const ratio = timeSpent / estimatedMinutes;
    
    if (ratio <= 0.7) return 1.2; // 20% bonus for quick completion
    if (ratio <= 1.0) return 1.1; // 10% bonus for on-time completion
    if (ratio <= 1.5) return 1.0; // No bonus/penalty
    return 0.9; // 10% penalty for slow completion
  }

  private parseTimeToMinutes(timeString: string): number | null {
    const timeRegex = /(\d+)\s*(minute|hour|min|hr)s?/i;
    const match = timeString.match(timeRegex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      return value * 60;
    }
    return value;
  }

  calculatePoints(factors: PointCalculationFactors): PointCalculationResult {
    const {
      basePoints,
      difficulty,
      userLevel,
      tasksCompletedToday,
      totalTasksCompleted,
      taskCategory,
      timeSpent,
      qualityScore
    } = factors;

    // Calculate all multipliers
    const difficultyMultiplier = this.difficultyMultipliers[difficulty as keyof typeof this.difficultyMultipliers] || 1.0;
    const levelPenalty = this.calculateLevelPenalty(userLevel);
    const dailyTasksPenalty = this.calculateDailyTasksPenalty(tasksCompletedToday);
    const categoryBonus = this.getCategoryBonus(taskCategory, totalTasksCompleted);
    const qualityBonus = this.calculateQualityBonus(qualityScore);
    const timeBonus = this.calculateTimeBonus(timeSpent);

    // Calculate total multiplier
    const totalMultiplier = difficultyMultiplier * levelPenalty * dailyTasksPenalty * categoryBonus * qualityBonus * timeBonus;

    // Calculate final points (minimum 1 point)
    const finalPoints = Math.max(1, Math.floor(basePoints * totalMultiplier));

    // Generate explanation
    const explanation: string[] = [];
    explanation.push(`Base points: ${basePoints}`);
    
    if (difficultyMultiplier !== 1.0) {
      explanation.push(`Difficulty (${difficulty}): ${difficultyMultiplier}x`);
    }
    
    if (levelPenalty < 1.0) {
      explanation.push(`Level ${userLevel} penalty: ${levelPenalty.toFixed(2)}x`);
    }
    
    if (dailyTasksPenalty < 1.0) {
      explanation.push(`Daily tasks penalty (${tasksCompletedToday} today): ${dailyTasksPenalty}x`);
    }
    
    if (categoryBonus !== 1.0) {
      explanation.push(`Category bonus (${taskCategory}): ${categoryBonus.toFixed(2)}x`);
    }
    
    if (qualityBonus !== 1.0) {
      explanation.push(`Quality bonus: ${qualityBonus}x`);
    }
    
    if (timeBonus !== 1.0) {
      explanation.push(`Time bonus: ${timeBonus}x`);
    }

    explanation.push(`Final: ${basePoints} × ${totalMultiplier.toFixed(2)} = ${finalPoints} points`);

    return {
      finalPoints,
      breakdown: {
        basePoints,
        difficultyMultiplier,
        levelPenalty,
        dailyTasksPenalty,
        categoryBonus,
        qualityBonus,
        timeBonus,
        totalMultiplier
      },
      explanation
    };
  }

  // Helper method to get user's tasks completed today
  async getUserTasksCompletedToday(userId: string): Promise<number> {
    // This would typically query the database
    // For now, return a placeholder
    return 0;
  }

  // Helper method to get total user level and tasks
  async getUserStats(userId: string): Promise<{ level: number; totalTasks: number }> {
    // This would typically query the user's profile
    return { level: 1, totalTasks: 0 };
  }
}

export const pointCalculationService = new PointCalculationService();
export type { PointCalculationFactors, PointCalculationResult };
