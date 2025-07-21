import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BrandWallet {
  id: string;
  brand_id: string;
  balance: number;
  total_deposited: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface BrandWalletTransaction {
  id: string;
  brand_id: string;
  wallet_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'campaign_charge' | 'refund';
  amount: number;
  balance_after: number;
  reference_id?: string;
  description: string;
  payment_transaction_id?: string;
  campaign_id?: string;
  created_at: string;
}

export const brandWalletService = {
  async getWallet(brandId: string): Promise<BrandWallet | null> {
    try {
      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', brandId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No wallet found, create one
          return await this.createWallet(brandId);
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching brand wallet:', error);
      toast.error('Failed to load wallet information');
      return null;
    }
  },

  async createWallet(brandId: string): Promise<BrandWallet | null> {
    try {
      const { data, error } = await supabase
        .from('brand_wallets')
        .insert({
          brand_id: brandId,
          balance: 0.00,
          total_deposited: 0.00,
          total_spent: 0.00
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error creating brand wallet:', error);
      toast.error('Failed to create wallet');
      return null;
    }
  },

  async getTransactions(brandId: string): Promise<BrandWalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('brand_wallet_transactions')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as BrandWalletTransaction[];
    } catch (error: any) {
      console.error('Error fetching wallet transactions:', error);
      toast.error('Failed to load transaction history');
      return [];
    }
  },

  async processWalletTransaction(
    brandId: string,
    transactionType: 'deposit' | 'withdrawal' | 'campaign_charge' | 'refund',
    amount: number,
    description: string,
    referenceId?: string,
    campaignId?: string,
    paymentTransactionId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('process_wallet_transaction', {
          p_brand_id: brandId,
          p_transaction_type: transactionType,
          p_amount: amount,
          p_description: description,
          p_reference_id: referenceId,
          p_campaign_id: campaignId,
          p_payment_transaction_id: paymentTransactionId
        });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error processing wallet transaction:', error);
      throw error;
    }
  },

  async checkSufficientBalance(brandId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await this.getWallet(brandId);
      return wallet ? wallet.balance >= amount : false;
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      return false;
    }
  }
};