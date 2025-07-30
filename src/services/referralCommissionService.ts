import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COMMISSION_POINTS = 10;

export const referralCommissionService = {
  /**
   * Awards 10 points commission to the referrer when their downline earns points
   */
  async awardCommission(downlineUserId: string, pointsEarned: number) {
    try {
      const { error } = await supabase.rpc('award_referral_commission', {
        downline_user_id: downlineUserId,
        points_earned: pointsEarned
      });

      if (error) {
        console.error('Error awarding referral commission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in commission service:', error);
      return false;
    }
  },

  /**
   * Gets commission earnings for a user
   */
  async getCommissionEarnings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('points, created_at, description')
        .eq('user_id', userId)
        .eq('transaction_type', 'referral_commission')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commission earnings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCommissionEarnings:', error);
      return [];
    }
  },

  /**
   * Gets total commission earnings for a user
   */
  async getTotalCommissionEarnings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('points')
        .eq('user_id', userId)
        .eq('transaction_type', 'referral_commission');

      if (error) {
        console.error('Error fetching total commission earnings:', error);
        return 0;
      }

      const total = data?.reduce((sum, transaction) => sum + transaction.points, 0) || 0;
      return total;
    } catch (error) {
      console.error('Error in getTotalCommissionEarnings:', error);
      return 0;
    }
  }
};