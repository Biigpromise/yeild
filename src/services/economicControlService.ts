import { supabase } from "@/integrations/supabase/client";

// Economic constants for sustainability
export const ECONOMIC_CONSTANTS = {
  // Point-to-dollar conversion: 200 points = $1.00
  POINTS_PER_DOLLAR: 200,
  
  // Daily earning limits per user (in points)
  DAILY_LIMITS: {
    NEW_USER: 500,      // First 30 days
    REGULAR_USER: 750,   // 30+ days, <100 tasks
    VETERAN_USER: 1000,  // 100+ tasks completed
    VIP_USER: 1500       // Special tier users
  },

  // Campaign budget controls
  CAMPAIGN_LIMITS: {
    MIN_BUDGET_USD: 50,      // Minimum $50 campaign
    MAX_BUDGET_USD: 10000,   // Maximum $10k campaign
    PLATFORM_FEE_PERCENT: 30, // 30% platform fee
    MAX_POINTS_PER_CAMPAIGN: 100000, // Hard cap per campaign
  },

  // Quality and participation controls
  PARTICIPATION: {
    EXPECTED_RATE: 0.03,     // 3% of users participate
    MAX_RATE: 0.05,          // Cap at 5% to prevent over-spending
    MIN_QUALITY_SCORE: 60,   // Minimum quality for payout
    QUALITY_BONUS_THRESHOLD: 80 // Quality bonus threshold
  }
};

interface UserEarningStats {
  userId: string;
  dailyEarnings: number;
  dailyLimit: number;
  canEarnMore: boolean;
  remainingCapacity: number;
}

interface CampaignBudgetInfo {
  campaignId: string;
  totalBudgetUSD: number;
  totalBudgetPoints: number;
  spentPoints: number;
  remainingPoints: number;
  participantCount: number;
  isOverBudget: boolean;
}

class EconomicControlService {
  // Check user's daily earning capacity
  async getUserDailyEarningStats(userId: string): Promise<UserEarningStats> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get user's daily earnings for today
    const { data: dailyTransactions } = await supabase
      .from('point_transactions')
      .select('points')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .in('transaction_type', ['task_completion', 'quality_bonus', 'early_bird_bonus']);
    
    const dailyEarnings = dailyTransactions?.reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0) || 0;
    
    // Get user profile to determine their tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, tasks_completed, level')
      .eq('id', userId)
      .single();
    
    // Determine daily limit based on user tier
    const daysSinceSignup = profile ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const tasksCompleted = profile?.tasks_completed || 0;
    const userLevel = profile?.level || 1;
    
    let dailyLimit = ECONOMIC_CONSTANTS.DAILY_LIMITS.NEW_USER;
    
    if (userLevel >= 10 || tasksCompleted >= 500) {
      dailyLimit = ECONOMIC_CONSTANTS.DAILY_LIMITS.VIP_USER;
    } else if (tasksCompleted >= 100) {
      dailyLimit = ECONOMIC_CONSTANTS.DAILY_LIMITS.VETERAN_USER;
    } else if (daysSinceSignup >= 30) {
      dailyLimit = ECONOMIC_CONSTANTS.DAILY_LIMITS.REGULAR_USER;
    }
    
    return {
      userId,
      dailyEarnings,
      dailyLimit,
      canEarnMore: dailyEarnings < dailyLimit,
      remainingCapacity: Math.max(0, dailyLimit - dailyEarnings)
    };
  }

  // Check campaign budget status
  async getCampaignBudgetInfo(campaignId: string): Promise<CampaignBudgetInfo> {
    // Get campaign details
    const { data: campaign } = await supabase
      .from('tasks')
      .select('id, title, points')
      .eq('id', campaignId)
      .single();
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get total submissions and points spent
    const { data: submissions } = await supabase
      .from('task_submissions')
      .select('calculated_points, status')
      .eq('task_id', campaignId);
    
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved') || [];
    const spentPoints = approvedSubmissions.reduce((sum, s) => sum + (s.calculated_points || 0), 0);
    const participantCount = submissions?.length || 0;
    
    // Calculate budget limits (assuming $1000 campaign as example)
    const estimatedBudgetUSD = 1000; // This should come from campaign metadata
    const platformRevenue = estimatedBudgetUSD * (ECONOMIC_CONSTANTS.CAMPAIGN_LIMITS.PLATFORM_FEE_PERCENT / 100);
    const availableForPayouts = estimatedBudgetUSD - platformRevenue;
    const totalBudgetPoints = availableForPayouts * ECONOMIC_CONSTANTS.POINTS_PER_DOLLAR;
    
    return {
      campaignId,
      totalBudgetUSD: estimatedBudgetUSD,
      totalBudgetPoints: Math.min(totalBudgetPoints, ECONOMIC_CONSTANTS.CAMPAIGN_LIMITS.MAX_POINTS_PER_CAMPAIGN),
      spentPoints,
      remainingPoints: Math.max(0, totalBudgetPoints - spentPoints),
      participantCount,
      isOverBudget: spentPoints >= totalBudgetPoints
    };
  }

  // Calculate safe point award considering all economic factors
  async calculateSafePointAward(
    userId: string, 
    campaignId: string, 
    basePoints: number,
    qualityScore?: number
  ): Promise<{
    awardedPoints: number;
    originalPoints: number;
    limitedBy: string[];
    explanation: string[];
  }> {
    const limitedBy: string[] = [];
    const explanation: string[] = [];
    let finalPoints = basePoints;

    // Check user's daily capacity
    const userStats = await this.getUserDailyEarningStats(userId);
    if (!userStats.canEarnMore) {
      return {
        awardedPoints: 0,
        originalPoints: basePoints,
        limitedBy: ['daily_limit_exceeded'],
        explanation: [`Daily earning limit of ${userStats.dailyLimit} points reached`]
      };
    }

    // Limit by remaining daily capacity
    if (finalPoints > userStats.remainingCapacity) {
      finalPoints = userStats.remainingCapacity;
      limitedBy.push('daily_capacity');
      explanation.push(`Limited to remaining daily capacity: ${userStats.remainingCapacity} points`);
    }

    // Check campaign budget
    const campaignBudget = await this.getCampaignBudgetInfo(campaignId);
    if (campaignBudget.isOverBudget) {
      return {
        awardedPoints: 0,
        originalPoints: basePoints,
        limitedBy: ['campaign_budget_exceeded'],
        explanation: ['Campaign budget has been exceeded']
      };
    }

    // Limit by remaining campaign budget
    if (finalPoints > campaignBudget.remainingPoints) {
      finalPoints = campaignBudget.remainingPoints;
      limitedBy.push('campaign_budget');
      explanation.push(`Limited by remaining campaign budget: ${campaignBudget.remainingPoints} points`);
    }

    // Apply quality controls
    if (qualityScore && qualityScore < ECONOMIC_CONSTANTS.PARTICIPATION.MIN_QUALITY_SCORE) {
      finalPoints = Math.floor(finalPoints * 0.5); // 50% reduction for low quality
      limitedBy.push('quality_penalty');
      explanation.push(`Quality score ${qualityScore} below minimum (${ECONOMIC_CONSTANTS.PARTICIPATION.MIN_QUALITY_SCORE}), 50% penalty applied`);
    }

    // Apply quality bonus
    if (qualityScore && qualityScore >= ECONOMIC_CONSTANTS.PARTICIPATION.QUALITY_BONUS_THRESHOLD) {
      const bonusMultiplier = 1 + ((qualityScore - 80) / 100); // Up to 20% bonus for perfect quality
      finalPoints = Math.floor(finalPoints * bonusMultiplier);
      explanation.push(`Quality bonus applied: ${Math.floor((bonusMultiplier - 1) * 100)}%`);
    }

    return {
      awardedPoints: Math.max(1, finalPoints), // Minimum 1 point
      originalPoints: basePoints,
      limitedBy,
      explanation
    };
  }

  // Get platform economic overview (for admin)
  async getPlatformEconomicOverview(): Promise<{
    totalUserCount: number;
    activeCampaigns: number;
    dailyPayouts: number;
    monthlyPayouts: number;
    averageParticipationRate: number;
    topSpendingCampaigns: any[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Get total user count
    const { count: totalUserCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Get active campaigns
    const { count: activeCampaigns } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    // Get daily payouts
    const { data: dailyTransactions } = await supabase
      .from('point_transactions')
      .select('points')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .in('transaction_type', ['task_completion', 'quality_bonus', 'early_bird_bonus']);
    
    const dailyPayouts = dailyTransactions?.reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0) || 0;

    // Get monthly payouts
    const { data: monthlyTransactions } = await supabase
      .from('point_transactions')
      .select('points')
      .gte('created_at', monthStart)
      .in('transaction_type', ['task_completion', 'quality_bonus', 'early_bird_bonus']);
    
    const monthlyPayouts = monthlyTransactions?.reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0) || 0;

    return {
      totalUserCount: totalUserCount || 0,
      activeCampaigns: activeCampaigns || 0,
      dailyPayouts,
      monthlyPayouts,
      averageParticipationRate: 0.03, // This would be calculated from actual data
      topSpendingCampaigns: [] // This would include campaign analysis
    };
  }

  // Emergency budget controls
  async emergencyBudgetControl(campaignId: string): Promise<boolean> {
    const budgetInfo = await this.getCampaignBudgetInfo(campaignId);
    
    if (budgetInfo.isOverBudget) {
      // Pause campaign to prevent further spending
      await supabase
        .from('tasks')
        .update({ status: 'paused' })
        .eq('id', campaignId);
      
      // Notify admins
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'budget_exceeded',
          message: `Campaign ${campaignId} has exceeded its budget and has been automatically paused`,
          link_to: `/admin/tasks/${campaignId}`
        });
      
      return true;
    }
    
    return false;
  }
}

export const economicControlService = new EconomicControlService();
export type { UserEarningStats, CampaignBudgetInfo };