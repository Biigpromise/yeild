import { supabase } from '@/integrations/supabase/client';

export interface PricingModel {
  id: string;
  currency: string;
  action_type: string;
  region?: string | null;
  min_cpa: number; // minimum cost per action in currency
  max_cpa: number; // maximum cost per action in currency
}

export interface ExpectedResultRange {
  min: number; // minimum expected actions
  max: number; // maximum expected actions
}

const DEFAULTS: Record<string, { min_cpa: number; max_cpa: number }> = {
  NGN: { min_cpa: 214, max_cpa: 300 },
  USD: { min_cpa: 0.143, max_cpa: 0.2 },
};

export const pricingService = {
  async getPricingModel(currency: string, actionType: string = 'task_completion', region?: string) {
    const { data, error } = await supabase
      .from('pricing_models')
      .select('*')
      .eq('currency', currency)
      .eq('action_type', actionType)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch pricing model:', error.message);
      return null;
    }

    return (data as PricingModel) || null;
  },

  async estimateExpectedActions(amount: number, currency: string = 'NGN', actionType: string = 'task_completion', region?: string): Promise<ExpectedResultRange | null> {
    if (!amount || amount <= 0) return null;

    const model = await this.getPricingModel(currency, actionType, region);

    const minCpa = model?.min_cpa ?? DEFAULTS[currency]?.min_cpa;
    const maxCpa = model?.max_cpa ?? DEFAULTS[currency]?.max_cpa;

    if (!minCpa || !maxCpa) return null;

    // Higher CPA -> fewer actions (min actions). Lower CPA -> more actions (max actions)
    const min = Math.floor(amount / maxCpa);
    const max = Math.floor(amount / minCpa);

    return { min, max };
  }
};
