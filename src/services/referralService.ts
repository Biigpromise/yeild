
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReferralProcessingResult {
  success: boolean;
  message: string;
  referrerName?: string;
  pointsAwarded?: number;
}

export const referralService = {
  async processReferralSignup(referralCode: string, newUserId: string): Promise<ReferralProcessingResult> {
    try {
      console.log('Processing referral signup:', { referralCode, newUserId });

      // First, find the referrer by referral code
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id, name, referral_code')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (referrerError) {
        console.error('Error finding referrer:', referrerError);
        return {
          success: false,
          message: 'Error processing referral code'
        };
      }

      if (!referrer) {
        console.log('No referrer found for code:', referralCode);
        return {
          success: false,
          message: 'Invalid referral code'
        };
      }

      // Check if this user was already referred by someone
      const { data: existingReferral, error: existingError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referred_id', newUserId)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing referral:', existingError);
      }

      if (existingReferral) {
        console.log('User already has a referral record');
        return {
          success: false,
          message: 'User already referred by someone else'
        };
      }

      // Create the referral record
      const { error: insertError } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: newUserId,
          referral_code: referralCode,
          is_active: false, // Will be activated when user completes tasks
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating referral record:', insertError);
        return {
          success: false,
          message: 'Failed to create referral record'
        };
      }

      // Update referrer's total referrals count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_referrals_count: supabase.raw('total_referrals_count + 1')
        })
        .eq('id', referrer.id);

      if (updateError) {
        console.error('Error updating referrer stats:', updateError);
        // Don't fail the whole process for this
      }

      console.log('Referral record created successfully');
      return {
        success: true,
        message: `Successfully referred by ${referrer.name || 'another user'}`,
        referrerName: referrer.name
      };

    } catch (error) {
      console.error('Unexpected error in referral processing:', error);
      return {
        success: false,
        message: 'Unexpected error processing referral'
      };
    }
  },

  async checkReferralActivation(userId: string): Promise<void> {
    try {
      console.log('Checking referral activation for user:', userId);

      // Get user's current stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tasks_completed, points')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Error getting user profile:', profileError);
        return;
      }

      // Check if user has an inactive referral
      const { data: referral, error: referralError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referred_id', userId)
        .eq('is_active', false)
        .maybeSingle();

      if (referralError) {
        console.error('Error checking referral:', referralError);
        return;
      }

      if (!referral) {
        console.log('No inactive referral found for user');
        return;
      }

      // Check if user meets activation criteria
      const hasCompletedTasks = profile.tasks_completed > 0;
      const hasMinimumPoints = profile.points >= 50;

      if (hasCompletedTasks || hasMinimumPoints) {
        console.log('User meets referral activation criteria');
        await this.activateReferral(referral.id, referral.referrer_id);
      }
    } catch (error) {
      console.error('Error in referral activation check:', error);
    }
  },

  async activateReferral(referralId: string, referrerId: string): Promise<void> {
    try {
      // Calculate points to award based on referrer's current referral count
      const pointsToAward = await this.calculateReferralPoints(referrerId);

      // Activate the referral
      const { error: activateError } = await supabase
        .from('user_referrals')
        .update({
          is_active: true,
          activated_at: new Date().toISOString(),
          points_awarded: pointsToAward
        })
        .eq('id', referralId);

      if (activateError) {
        console.error('Error activating referral:', activateError);
        return;
      }

      // Award points to referrer
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({
          points: supabase.raw(`points + ${pointsToAward}`),
          active_referrals_count: supabase.raw('active_referrals_count + 1')
        })
        .eq('id', referrerId);

      if (pointsError) {
        console.error('Error awarding points to referrer:', pointsError);
        return;
      }

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: referrerId,
          points: pointsToAward,
          transaction_type: 'referral_bonus',
          reference_id: referralId,
          description: `Referral bonus: ${pointsToAward} points`
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      }

      console.log(`Referral activated! Awarded ${pointsToAward} points to referrer`);
    } catch (error) {
      console.error('Error activating referral:', error);
    }
  },

  async calculateReferralPoints(referrerId: string): Promise<number> {
    try {
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', referrerId)
        .eq('is_active', true);

      if (error) {
        console.error('Error calculating referral points:', error);
        return 10; // Default points
      }

      const activeReferralCount = referrals?.length || 0;

      // Tiered point system
      if (activeReferralCount < 5) {
        return 10; // First 5 referrals: 10 points each
      } else if (activeReferralCount < 15) {
        return 20; // Next 10 referrals: 20 points each
      } else {
        return 30; // After 15 referrals: 30 points each
      }
    } catch (error) {
      console.error('Error calculating referral points:', error);
      return 10; // Default points
    }
  },

  async getReferralStats(userId: string) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_referrals_count, active_referrals_count')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error getting referral stats:', profileError);
        return null;
      }

      return {
        totalReferrals: profile.total_referrals_count || 0,
        activeReferrals: profile.active_referrals_count || 0
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }
  }
};
