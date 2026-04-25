// YEILD Job Categories — defines the 8 ways operators get paid.
// This complements the 6 pricing tiers (which set price brackets) by
// describing HOW the work is structured and which bonuses apply.

export type PricingModel =
  | 'flat'
  | 'flat_plus_bonus'
  | 'cpa'
  | 'base_plus_variable'
  | 'flat_plus_reimbursement'
  | 'hourly_or_quote'
  | 'commission'
  | 'recurring';

export type JobCategoryCode =
  | 'quick_action'
  | 'content_creation'
  | 'lead_generation'
  | 'field_work'
  | 'mystery_shopping'
  | 'specialist_audit'
  | 'performance_sales'
  | 'recurring_retainer';

export interface JobCategory {
  code: JobCategoryCode;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  pricingModel: PricingModel;
  defaultMinNGN: number;
  defaultMaxNGN: number;
  defaultBaseNGN: number;
  effortEstimate: string;
  supportsRankMultiplier: boolean;
  supportsQualityBonus: boolean;
  supportsOutcomeBonus: boolean;
  supportsCommission: boolean;
  supportsHourly: boolean;
  supportsExpenseReimbursement: boolean;
  displayOrder: number;
  badgeColor: string; // tailwind classes for the chip
}

// Static mirror of the seeded job_categories rows. Use as fallback when
// the DB hasn't been queried yet (e.g. SSR or first paint).
export const JOB_CATEGORIES: JobCategory[] = [
  {
    code: 'quick_action',
    name: 'Quick Action',
    description: 'Short tasks that take a few minutes — share a post, join a channel, simple confirmations.',
    icon: 'Zap',
    pricingModel: 'flat',
    defaultMinNGN: 300,
    defaultMaxNGN: 800,
    defaultBaseNGN: 500,
    effortEstimate: '2–5 minutes',
    supportsRankMultiplier: true,
    supportsQualityBonus: false,
    supportsOutcomeBonus: false,
    supportsCommission: false,
    supportsHourly: false,
    supportsExpenseReimbursement: false,
    displayOrder: 1,
    badgeColor: 'bg-sky-500/10 text-sky-700 border-sky-500/30',
  },
  {
    code: 'content_creation',
    name: 'Content Creation',
    description: 'Writing reviews, recording videos, designing visuals. Quality bonuses available.',
    icon: 'PenTool',
    pricingModel: 'flat_plus_bonus',
    defaultMinNGN: 2000,
    defaultMaxNGN: 15000,
    defaultBaseNGN: 5000,
    effortEstimate: '20–60 minutes',
    supportsRankMultiplier: true,
    supportsQualityBonus: true,
    supportsOutcomeBonus: false,
    supportsCommission: false,
    supportsHourly: false,
    supportsExpenseReimbursement: false,
    displayOrder: 2,
    badgeColor: 'bg-violet-500/10 text-violet-700 border-violet-500/30',
  },
  {
    code: 'lead_generation',
    name: 'Lead Generation',
    description: 'Cost-per-action: signups, demo bookings, deposits, verified conversions.',
    icon: 'Target',
    pricingModel: 'cpa',
    defaultMinNGN: 500,
    defaultMaxNGN: 10000,
    defaultBaseNGN: 2000,
    effortEstimate: 'Per verified lead',
    supportsRankMultiplier: true,
    supportsQualityBonus: true,
    supportsOutcomeBonus: true,
    supportsCommission: false,
    supportsHourly: false,
    supportsExpenseReimbursement: false,
    displayOrder: 3,
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  },
  {
    code: 'field_work',
    name: 'Field Work',
    description: 'On-site jobs: property inspections, store audits, ground activations. Distance + time included.',
    icon: 'MapPin',
    pricingModel: 'base_plus_variable',
    defaultMinNGN: 5000,
    defaultMaxNGN: 50000,
    defaultBaseNGN: 10000,
    effortEstimate: '1–4 hours on site',
    supportsRankMultiplier: true,
    supportsQualityBonus: true,
    supportsOutcomeBonus: false,
    supportsCommission: false,
    supportsHourly: false,
    supportsExpenseReimbursement: false,
    displayOrder: 4,
    badgeColor: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  },
  {
    code: 'mystery_shopping',
    name: 'Mystery Shopping',
    description: 'Visit a store, evaluate service, buy a product. Receipts reimbursed.',
    icon: 'ShoppingBag',
    pricingModel: 'flat_plus_reimbursement',
    defaultMinNGN: 3000,
    defaultMaxNGN: 12000,
    defaultBaseNGN: 5000,
    effortEstimate: '30–90 minutes',
    supportsRankMultiplier: true,
    supportsQualityBonus: true,
    supportsOutcomeBonus: false,
    supportsCommission: false,
    supportsHourly: false,
    supportsExpenseReimbursement: true,
    displayOrder: 5,
    badgeColor: 'bg-pink-500/10 text-pink-700 border-pink-500/30',
  },
  {
    code: 'specialist_audit',
    name: 'Specialist / Audit',
    description: 'Expert reviews, compliance checks, professional audits. Hourly or quoted.',
    icon: 'ShieldCheck',
    pricingModel: 'hourly_or_quote',
    defaultMinNGN: 5000,
    defaultMaxNGN: 200000,
    defaultBaseNGN: 25000,
    effortEstimate: 'Hourly or per project',
    supportsRankMultiplier: true,
    supportsQualityBonus: true,
    supportsOutcomeBonus: false,
    supportsCommission: false,
    supportsHourly: true,
    supportsExpenseReimbursement: false,
    displayOrder: 6,
    badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-500/30',
  },
  {
    code: 'performance_sales',
    name: 'Performance / Sales',
    description: 'Commission-based: asset sales, paid referrals, closed deals.',
    icon: 'TrendingUp',
    pricingModel: 'commission',
    defaultMinNGN: 1000,
    defaultMaxNGN: 500000,
    defaultBaseNGN: 5000,
    effortEstimate: '% of deal value',
    supportsRankMultiplier: true,
    supportsQualityBonus: false,
    supportsOutcomeBonus: true,
    supportsCommission: true,
    supportsHourly: false,
    supportsExpenseReimbursement: false,
    displayOrder: 7,
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  },
  {
    code: 'recurring_retainer',
    name: 'Recurring / Retainer',
    description: 'Ongoing monthly engagements: community moderation, support, account management.',
    icon: 'Repeat',
    pricingModel: 'recurring',
    defaultMinNGN: 20000,
    defaultMaxNGN: 200000,
    defaultBaseNGN: 50000,
    effortEstimate: 'Monthly engagement',
    supportsRankMultiplier: true,
    supportsQualityBonus: true,
    supportsOutcomeBonus: false,
    supportsCommission: false,
    supportsHourly: false,
    supportsExpenseReimbursement: false,
    displayOrder: 8,
    badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30',
  },
];

export function getJobCategory(code?: string | null): JobCategory | undefined {
  if (!code) return undefined;
  return JOB_CATEGORIES.find((c) => c.code === code);
}

// Rank-based payout multipliers. Brands pay more for higher-ranked operators
// because they're verified, faster, and convert better.
export const RANK_MULTIPLIERS: Record<number, number> = {
  1: 1.0, // Dove
  2: 1.1, // Hawk
  3: 1.25, // Eagle
  4: 1.5, // Falcon
  5: 2.0, // Phoenix
};

export function getRankMultiplier(rankLevel: number): number {
  return RANK_MULTIPLIERS[rankLevel] ?? 1.0;
}

/**
 * Compute final payout for a submission given:
 * - basePayout: NGN amount the order specifies
 * - rankLevel: operator's rank (1-5) — only applied if order opts in
 * - qualityBonusPct: 0-quality_bonus_max_pct, awarded by brand on review
 * - outcomeAwarded: true when the lead/sale converts (adds outcome_bonus_pct)
 * - outcomeBonusPct: order's outcome bonus %
 * - commissionPct + dealValue: for commission jobs, overrides basePayout
 * - hourlyRateNGN + hoursWorked: for hourly jobs, overrides basePayout
 * - expenseReimbursedNGN: pass-through reimbursement (mystery shopping)
 */
export interface PayoutInput {
  basePayoutNGN: number;
  rankLevel?: number;
  rankMultiplierEnabled?: boolean;
  qualityBonusPct?: number;
  outcomeAwarded?: boolean;
  outcomeBonusPct?: number;
  commissionPct?: number;
  dealValueNGN?: number;
  hourlyRateNGN?: number;
  hoursWorked?: number;
  expenseReimbursedNGN?: number;
}

export interface PayoutBreakdown {
  baseNGN: number;
  rankMultiplier: number;
  rankBonusNGN: number;
  qualityBonusNGN: number;
  outcomeBonusNGN: number;
  commissionNGN: number;
  hourlyNGN: number;
  reimbursementNGN: number;
  totalNGN: number;
}

export function calculatePayout(input: PayoutInput): PayoutBreakdown {
  const {
    basePayoutNGN,
    rankLevel = 1,
    rankMultiplierEnabled = true,
    qualityBonusPct = 0,
    outcomeAwarded = false,
    outcomeBonusPct = 0,
    commissionPct,
    dealValueNGN = 0,
    hourlyRateNGN,
    hoursWorked = 0,
    expenseReimbursedNGN = 0,
  } = input;

  // Commission jobs: payout = % of deal value
  let core = basePayoutNGN;
  let commissionNGN = 0;
  let hourlyNGN = 0;

  if (commissionPct && dealValueNGN > 0) {
    commissionNGN = Math.floor((dealValueNGN * commissionPct) / 100);
    core = commissionNGN;
  } else if (hourlyRateNGN && hoursWorked > 0) {
    hourlyNGN = Math.floor(hourlyRateNGN * hoursWorked);
    core = hourlyNGN;
  }

  const multiplier = rankMultiplierEnabled ? getRankMultiplier(rankLevel) : 1.0;
  const afterRank = Math.floor(core * multiplier);
  const rankBonusNGN = afterRank - core;

  const qualityBonusNGN = Math.floor((afterRank * qualityBonusPct) / 100);
  const outcomeBonusNGN = outcomeAwarded ? Math.floor((afterRank * outcomeBonusPct) / 100) : 0;

  const totalNGN = afterRank + qualityBonusNGN + outcomeBonusNGN + expenseReimbursedNGN;

  return {
    baseNGN: core,
    rankMultiplier: multiplier,
    rankBonusNGN,
    qualityBonusNGN,
    outcomeBonusNGN,
    commissionNGN,
    hourlyNGN,
    reimbursementNGN: expenseReimbursedNGN,
    totalNGN,
  };
}
