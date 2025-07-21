
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
  operation: () => Promise<T>,
  context: string,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`${context} - Attempt ${i + 1} failed:`, error);
      
      if (i === attempts - 1) {
        throw error;
      }
      
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
  throw new Error(`${context} failed after ${attempts} attempts`);
};

export const referralService = {
  async getReferralStats(userId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('active_referrals_count, total_referrals_count')
          .eq('id', userId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch referral stats: ${error.message}`);
        }

        return {
          activeReferrals: data.active_referrals_count || 0,
          totalReferrals: data.total_referrals_count || 0
        };
      }, 'getReferralStats');
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast.error('Failed to load referral statistics');
      return { activeReferrals: 0, totalReferrals: 0 };
    }
  },

  async checkReferralActivation(userId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .rpc('check_and_activate_referral', { user_id: userId });

        if (error) {
          throw new Error(`Failed to check referral activation: ${error.message}`);
        }

        return data;
      }, 'checkReferralActivation');
    } catch (error) {
      console.error('Error checking referral activation:', error);
      // Don't show toast for this as it's called periodically
      return null;
    }
  },

  async getUserReferrals(userId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('user_referrals')
          .select(`
            *,
            referred_profile:profiles!user_referrals_referred_id_fkey(name, email)
          `)
          .eq('referrer_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch user referrals: ${error.message}`);
        }

        return data || [];
      }, 'getUserReferrals');
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      toast.error('Failed to load referrals');
      return [];
    }
  },

  async createReferral(referrerId: string, referredId: string, referralCode: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('user_referrals')
          .insert({
            referrer_id: referrerId,
            referred_id: referredId,
            referral_code: referralCode
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create referral: ${error.message}`);
        }

        return data;
      }, 'createReferral');
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
      return null;
    }
  },

  async processReferralSignup(referralCode: string, newUserId: string) {
    try {
      return await withRetry(async () => {
        // First, find the referrer by referral code
        const { data: referrer, error: referrerError } = await supabase
          .from('profiles')
          .select('id, total_referrals_count')
          .eq('referral_code', referralCode)
          .single();

        if (referrerError || !referrer) {
          throw new Error('Invalid referral code');
        }

        // Create the referral relationship
        const { error: createError } = await supabase
          .from('user_referrals')
          .insert({
            referrer_id: referrer.id,
            referred_id: newUserId,
            referral_code: referralCode,
            is_active: false // Will be activated when user completes first task
          });

        if (createError) {
          throw new Error(`Failed to create referral: ${createError.message}`);
        }

        // Update referrer's total referral count
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            total_referrals_count: (referrer.total_referrals_count || 0) + 1
          })
          .eq('id', referrer.id);

        if (updateError) {
          console.error('Error updating referrer count:', updateError);
        }

        return { success: true };
      }, 'processReferralSignup');
    } catch (error) {
      console.error('Error processing referral signup:', error);
      return { success: false, error: error.message };
    }
  }
};
