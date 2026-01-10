// YEILD Execution Order Types

export interface OperatorRank {
  id: number;
  rank_level: number;
  name: string;
  emoji: string;
  icon: string;
  color: string;
  description: string;
  min_verified_executions: number;
  min_success_rate: number;
  allowed_template_codes: string[];
  decay_rate_percent: number;
  penalty_multiplier: number;
  benefits: string[];
}

export interface ExecutionOrderTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  action_definition: string;
  required_proof_types: string[];
  verification_window_hours: number;
  difficulty_level: 'basic' | 'standard' | 'priority' | 'high-value' | 'audit';
  base_credit_value: number;
  min_rank_level: number;
  is_enabled: boolean;
  requires_manual_verification: boolean;
  icon?: string;
  category?: string;
}

export interface ExecutionOrder {
  id: string;
  template_id: string;
  brand_id: string;
  campaign_id?: string;
  title: string;
  custom_instructions?: string;
  required_platform?: string;
  required_media_urls?: string[];
  required_caption?: string;
  target_quantity: number;
  completed_quantity: number;
  verification_window_hours: number;
  operator_payout: number;
  platform_fee: number;
  brand_total_cost: number;
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled';
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  template?: ExecutionOrderTemplate;
}

export interface ExecutionSubmission {
  id: string;
  order_id: string;
  operator_id: string;
  status: 'pending_auto' | 'pending_review' | 'verified' | 'rejected' | 'disputed';
  submitted_at: string;
  verification_started_at?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  rejection_category?: string;
  credits_earned?: number;
  credits_released_at?: string;
  is_first_execution: boolean;
  is_random_sample: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  order?: ExecutionOrder;
  proofs?: ExecutionProof[];
}

export interface ExecutionProof {
  id: string;
  submission_id: string;
  proof_type: 'screenshot' | 'public_url' | 'video' | 'geo_photo' | 'confirmation_id' | 'submission_confirmation' | 'device_verification' | 'timestamp_verification';
  file_url?: string;
  external_url?: string;
  metadata?: Record<string, any>;
  file_hash?: string;
  auto_validation_status: 'pending' | 'passed' | 'failed' | 'flagged';
  auto_validation_notes?: string;
  created_at: string;
}

export interface BrandQualification {
  id: string;
  brand_id: string;
  company_name: string;
  website_url: string;
  country: string;
  category: 'startup' | 'sme' | 'digital_product' | 'fintech' | 'ecommerce' | 'saas' | 'local_service' | 'utility' | 'other';
  accepted_execution_rules: boolean;
  accepted_verification_delays: boolean;
  accepted_no_direct_contact: boolean;
  accepted_yeild_authority: boolean;
  qualification_status: 'pending' | 'qualified' | 'rejected' | 'suspended';
  qualified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OperatorStats {
  operator_rank_level: number;
  verified_executions: number;
  failed_executions: number;
  execution_success_rate: number;
  last_execution_at?: string;
  execution_credits_balance: number;
  execution_credits_pending: number;
  execution_credits_lifetime: number;
}

// Platform constants - Updated per YEILD spec (10-20% range, performance-based)
export const PLATFORM_FEE_PERCENT = 15; // Default middle of 10-20% range
export const PLATFORM_FEE_MIN = 10;
export const PLATFORM_FEE_MAX = 20;
export const MIN_PAYOUT_THRESHOLD = 1000;
export const PAYOUT_HOLD_DAYS = 7;

// Campaign creation fees (NGN)
export const CAMPAIGN_CREATION_FEE_DIGITAL = 10000;
export const CAMPAIGN_CREATION_FEE_FIELD = 50000;

// Execution Modes
export type ExecutionMode = 'digital' | 'field';

export interface ExecutionModeConfig {
  id: ExecutionMode;
  name: string;
  description: string;
  eligibleRankLevels: number[];
  useCases: string[];
  verificationTypes: string[];
  platformFeeMin: number;
  platformFeeMax: number;
}

export const EXECUTION_MODES: ExecutionModeConfig[] = [
  {
    id: 'digital',
    name: 'Digital Execution Mode',
    description: 'Online execution for digital products, fintech, SaaS, e-commerce, and digital referrals',
    eligibleRankLevels: [1, 2, 3], // Dove, Hawk, Eagle
    useCases: ['Online real estate platforms', 'Fintech products', 'SaaS', 'Subscriptions', 'E-commerce', 'Digital referrals'],
    verificationTypes: ['referral_tracking', 'conversion_id', 'payment_confirmation', 'brand_approval', 'webhook'],
    platformFeeMin: 10,
    platformFeeMax: 15
  },
  {
    id: 'field',
    name: 'Field Execution Mode',
    description: 'Offline/hybrid execution for physical inspections, asset sales, events, and ground activations',
    eligibleRankLevels: [3, 4, 5], // Eagle, Falcon, Phoenix
    useCases: ['Property inspections', 'Physical asset sales', 'Events', 'Ground activations'],
    verificationTypes: ['gps_location', 'timestamped_media', 'client_confirmation', 'brand_validation'],
    platformFeeMin: 15,
    platformFeeMax: 20
  }
];

// Reward types
export type RewardType = 'fixed' | 'percentage';

// Forbidden keywords for execution order validation
export const FORBIDDEN_KEYWORDS = [
  'likes', 'like', 'follows', 'follow', 'followers',
  'subscriber', 'subscribers', 'subscribe',
  'watch', 'views', 'view', 'impressions',
  'engagement', 'reach', 'exposure', 'viral', 'trending'
];

export function validateExecutionOrderContent(text: string): { valid: boolean; blockedKeyword?: string } {
  const lowerText = text.toLowerCase();
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return { valid: false, blockedKeyword: keyword };
    }
  }
  return { valid: true };
}

export function calculatePlatformFee(operatorPayout: number, feePercent: number = PLATFORM_FEE_PERCENT): number {
  // Platform fee is X% of total, so if operator gets Y, brand pays Y / (1 - X/100)
  // Platform fee = total - operator = Y * (X / (100 - X))
  return Math.ceil(operatorPayout * (feePercent / (100 - feePercent)));
}

export function calculateBrandTotalCost(operatorPayout: number, feePercent: number = PLATFORM_FEE_PERCENT): number {
  return operatorPayout + calculatePlatformFee(operatorPayout, feePercent);
}

export function getCampaignCreationFee(mode: ExecutionMode): number {
  return mode === 'field' ? CAMPAIGN_CREATION_FEE_FIELD : CAMPAIGN_CREATION_FEE_DIGITAL;
}

export function getExecutionModeForRank(rankLevel: number): ExecutionMode[] {
  const modes: ExecutionMode[] = [];
  for (const mode of EXECUTION_MODES) {
    if (mode.eligibleRankLevels.includes(rankLevel)) {
      modes.push(mode.id);
    }
  }
  return modes;
}
