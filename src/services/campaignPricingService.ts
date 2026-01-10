import { supabase } from '@/integrations/supabase/client';
import {
  ExecutionMode,
  PLATFORM_FEE_PERCENT,
  PLATFORM_FEE_MIN,
  PLATFORM_FEE_MAX,
  CAMPAIGN_CREATION_FEE_DIGITAL,
  CAMPAIGN_CREATION_FEE_FIELD,
  EXECUTION_MODES,
  calculatePlatformFee,
  calculateBrandTotalCost
} from '@/types/execution';

export interface PricingBreakdown {
  operatorPayout: number;
  platformFee: number;
  platformFeePercent: number;
  brandTotalCost: number;
  campaignCreationFee: number;
  totalWithCreationFee: number;
}

export interface ExecutionModeDetails {
  id: ExecutionMode;
  name: string;
  description: string;
  eligibleRankLevels: number[];
  useCases: string[];
  verificationTypes: string[];
  platformFeeRange: { min: number; max: number };
  creationFee: number;
}

export const campaignPricingService = {
  /**
   * Get the dynamic platform fee based on execution mode and risk factors
   */
  getDynamicPlatformFee(
    mode: ExecutionMode,
    riskLevel: 'low' | 'medium' | 'high' = 'medium'
  ): number {
    const modeConfig = EXECUTION_MODES.find(m => m.id === mode);
    if (!modeConfig) return PLATFORM_FEE_PERCENT;

    const { platformFeeMin, platformFeeMax } = modeConfig;
    
    // Risk-based fee calculation within the mode's range
    switch (riskLevel) {
      case 'low':
        return platformFeeMin;
      case 'high':
        return platformFeeMax;
      default:
        return Math.round((platformFeeMin + platformFeeMax) / 2);
    }
  },

  /**
   * Calculate complete pricing breakdown for a campaign/execution order
   */
  calculatePricingBreakdown(
    operatorPayout: number,
    mode: ExecutionMode = 'digital',
    riskLevel: 'low' | 'medium' | 'high' = 'medium',
    includeCreationFee: boolean = true
  ): PricingBreakdown {
    const platformFeePercent = this.getDynamicPlatformFee(mode, riskLevel);
    const platformFee = calculatePlatformFee(operatorPayout, platformFeePercent);
    const brandTotalCost = calculateBrandTotalCost(operatorPayout, platformFeePercent);
    const campaignCreationFee = includeCreationFee 
      ? (mode === 'field' ? CAMPAIGN_CREATION_FEE_FIELD : CAMPAIGN_CREATION_FEE_DIGITAL)
      : 0;

    return {
      operatorPayout,
      platformFee,
      platformFeePercent,
      brandTotalCost,
      campaignCreationFee,
      totalWithCreationFee: brandTotalCost + campaignCreationFee
    };
  },

  /**
   * Get execution mode details with pricing info
   */
  getExecutionModeDetails(): ExecutionModeDetails[] {
    return EXECUTION_MODES.map(mode => ({
      id: mode.id,
      name: mode.name,
      description: mode.description,
      eligibleRankLevels: mode.eligibleRankLevels,
      useCases: mode.useCases,
      verificationTypes: mode.verificationTypes,
      platformFeeRange: {
        min: mode.platformFeeMin,
        max: mode.platformFeeMax
      },
      creationFee: mode.id === 'field' ? CAMPAIGN_CREATION_FEE_FIELD : CAMPAIGN_CREATION_FEE_DIGITAL
    }));
  },

  /**
   * Fetch execution modes from database (with fallback to static config)
   */
  async fetchExecutionModes(): Promise<ExecutionModeDetails[]> {
    try {
      const { data, error } = await supabase
        .from('execution_modes')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        console.warn('Using static execution modes config');
        return this.getExecutionModeDetails();
      }

      return data.map((mode: any) => ({
        id: mode.id as ExecutionMode,
        name: mode.name,
        description: mode.description,
        eligibleRankLevels: mode.eligible_rank_levels || [],
        useCases: mode.use_cases || [],
        verificationTypes: mode.verification_types || [],
        platformFeeRange: {
          min: mode.platform_fee_min || PLATFORM_FEE_MIN,
          max: mode.platform_fee_max || PLATFORM_FEE_MAX
        },
        creationFee: mode.id === 'field' ? CAMPAIGN_CREATION_FEE_FIELD : CAMPAIGN_CREATION_FEE_DIGITAL
      }));
    } catch (err) {
      console.error('Error fetching execution modes:', err);
      return this.getExecutionModeDetails();
    }
  },

  /**
   * Check if a brand can afford a campaign
   */
  async checkBrandBalance(brandId: string, requiredAmount: number): Promise<{
    hasBalance: boolean;
    currentBalance: number;
    shortfall: number;
  }> {
    try {
      const { data: wallet } = await supabase
        .from('brand_wallets')
        .select('balance')
        .eq('brand_id', brandId)
        .maybeSingle();

      const currentBalance = wallet?.balance || 0;
      const hasBalance = currentBalance >= requiredAmount;

      return {
        hasBalance,
        currentBalance,
        shortfall: hasBalance ? 0 : requiredAmount - currentBalance
      };
    } catch (err) {
      console.error('Error checking brand balance:', err);
      return { hasBalance: false, currentBalance: 0, shortfall: requiredAmount };
    }
  },

  /**
   * Record campaign fee payment
   */
  async recordCampaignFee(
    brandId: string,
    feeAmount: number,
    feeType: ExecutionMode,
    executionOrderId?: string,
    campaignId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaign_fees')
        .insert({
          brand_id: brandId,
          fee_amount: feeAmount,
          fee_type: feeType,
          execution_order_id: executionOrderId,
          campaign_id: campaignId,
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error recording campaign fee:', err);
      return false;
    }
  },

  /**
   * Get rank name for display
   */
  getRankName(rankLevel: number): string {
    const rankNames: Record<number, string> = {
      1: 'Dove',
      2: 'Hawk',
      3: 'Eagle',
      4: 'Falcon',
      5: 'Phoenix'
    };
    return rankNames[rankLevel] || 'Unknown';
  },

  /**
   * Get eligible ranks for a mode as display string
   */
  getEligibleRanksDisplay(mode: ExecutionMode): string {
    const modeConfig = EXECUTION_MODES.find(m => m.id === mode);
    if (!modeConfig) return 'Unknown';
    
    return modeConfig.eligibleRankLevels
      .map(level => this.getRankName(level))
      .join(', ');
  }
};

export default campaignPricingService;
