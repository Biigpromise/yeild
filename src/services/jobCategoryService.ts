import { supabase } from '@/integrations/supabase/client';
import { JOB_CATEGORIES, JobCategory, JobCategoryCode } from '@/types/jobCategories';

/**
 * Fetches the active job categories from the database.
 * Falls back to the static JOB_CATEGORIES list if the request fails.
 */
export const jobCategoryService = {
  async listActive(): Promise<JobCategory[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return JOB_CATEGORIES;
      }

      return data.map((row: any): JobCategory => {
        const fallback = JOB_CATEGORIES.find((c) => c.code === row.code);
        return {
          code: row.code as JobCategoryCode,
          name: row.name,
          description: row.description,
          icon: row.icon ?? fallback?.icon ?? 'Briefcase',
          pricingModel: row.pricing_model,
          defaultMinNGN: row.default_min_ngn,
          defaultMaxNGN: row.default_max_ngn,
          defaultBaseNGN: row.default_base_ngn,
          effortEstimate: row.effort_estimate ?? '',
          supportsRankMultiplier: row.supports_rank_multiplier,
          supportsQualityBonus: row.supports_quality_bonus,
          supportsOutcomeBonus: row.supports_outcome_bonus,
          supportsCommission: row.supports_commission,
          supportsHourly: row.supports_hourly,
          supportsExpenseReimbursement: row.supports_expense_reimbursement,
          displayOrder: row.display_order,
          badgeColor: fallback?.badgeColor ?? 'bg-muted text-muted-foreground border-border',
        };
      });
    } catch {
      return JOB_CATEGORIES;
    }
  },
};
