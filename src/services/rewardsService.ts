
import { supabase } from "@/integrations/supabase/client";

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  reward_type: 'digital' | 'physical' | 'discount' | 'badge';
  reward_value: string;
  image_url: string;
  stock_quantity: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  achievement_type: 'milestone' | 'streak' | 'special';
  requirement_value: number;
  requirement_type: 'tasks_completed' | 'points_earned' | 'streak_days';
  points_reward: number;
  badge_icon: string;
  badge_color: string;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievements: Achievement;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  redemption_code: string;
  redeemed_at: string;
  delivered_at: string | null;
  admin_notes: string | null;
  rewards: Reward;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: 'task_completion' | 'reward_redemption' | 'admin_adjustment' | 'bonus' | 'achievement';
  reference_id: string | null;
  description: string;
  created_at: string;
}

export const rewardsService = {
  // Get all active rewards
  async getRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get all active achievements
  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('requirement_value', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get user's achievements
  async getUserAchievements(userId?: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements(*)
      `)
      .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user's redemption history
  async getUserRedemptions(userId?: string): Promise<RewardRedemption[]> {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .select(`
        *,
        rewards(*)
      `)
      .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
      .order('redeemed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user's point transaction history
  async getPointTransactions(userId?: string): Promise<PointTransaction[]> {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },

  // Redeem a reward
  async redeemReward(rewardId: string): Promise<string> {
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_reward_id: rewardId
    });
    
    if (error) throw error;
    return data;
  },

  // Check and award achievements (called after task completion)
  async checkAndAwardAchievements(userId?: string): Promise<void> {
    const { error } = await supabase.rpc('check_and_award_achievements', {
      p_user_id: userId || (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) throw error;
  },

  // Admin functions
  admin: {
    // Get all rewards for admin
    async getAllRewards(): Promise<Reward[]> {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Create reward
    async createReward(reward: Omit<Reward, 'id' | 'created_at' | 'updated_at'>): Promise<Reward> {
      const { data, error } = await supabase
        .from('rewards')
        .insert(reward)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update reward
    async updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Get all achievements for admin
    async getAllAchievements(): Promise<Achievement[]> {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Create achievement
    async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> {
      const { data, error } = await supabase
        .from('achievements')
        .insert(achievement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update achievement
    async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement> {
      const { data, error } = await supabase
        .from('achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Get all redemptions for admin
    async getAllRedemptions(): Promise<RewardRedemption[]> {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards(*),
          profiles!reward_redemptions_user_id_fkey(name, email)
        `)
        .order('redeemed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    // Update redemption status
    async updateRedemptionStatus(id: string, status: RewardRedemption['status'], adminNotes?: string): Promise<RewardRedemption> {
      const updates: Partial<RewardRedemption> = { 
        status, 
        admin_notes: adminNotes 
      };
      
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('reward_redemptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};
