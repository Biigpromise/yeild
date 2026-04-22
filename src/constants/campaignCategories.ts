// Shared campaign categories used across Quick, Standard, and Advanced campaign creators.
// Keeping a single source ensures consistent options (digital + field-friendly) across all flows.

export interface CampaignCategoryOption {
  value: string;
  label: string;
}

// Yeild is a human-verified execution platform — not an engagement/follow platform.
// Categories below are limited to verifiable, structured business outcomes
// (digital execution + field activation). Do NOT add engagement/follow/like categories.
export const CAMPAIGN_CATEGORY_OPTIONS: CampaignCategoryOption[] = [
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'sales_promotion', label: 'Sales Promotion' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'event_promotion', label: 'Event Promotion' },
  { value: 'reviews_testimonials', label: 'Reviews & Testimonials' },
  { value: 'field_activation', label: 'Field Activation' },
  { value: 'in_store_promotion', label: 'In-Store Promotion' },
  { value: 'product_sampling', label: 'Product Sampling' },
  { value: 'street_marketing', label: 'Street Marketing' },
];
