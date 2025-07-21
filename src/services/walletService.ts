
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

export const walletService = {
  async getWalletBalance(userId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('yield_wallets')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch wallet balance: ${error.message}`);
        }

        return data;
      }, 'getWalletBalance');
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      toast.error('Failed to load wallet balance');
      return null;
    }
  },

  async updateWalletBalance(userId: string, amount: number) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('yield_wallets')
          .update({ balance: amount })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update wallet balance: ${error.message}`);
        }

        return data;
      }, 'updateWalletBalance');
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      toast.error('Failed to update wallet balance');
      return null;
    }
  },

  async getTransactionHistory(userId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch transaction history: ${error.message}`);
        }

        return data || [];
      }, 'getTransactionHistory');
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      toast.error('Failed to load transaction history');
      return [];
    }
  }
};
