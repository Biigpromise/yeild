// Shared campaign categories used across Quick, Standard, and Advanced campaign creators.
// Keeping a single source ensures consistent options (digital + field-friendly) across all flows.

export interface CampaignCategoryOption {
  value: string;
  label: string;
}

export const CAMPAIGN_CATEGORY_OPTIONS: CampaignCategoryOption[] = [
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'sales_promotion', label: 'Sales Promotion' },
  { value: 'social_media_marketing', label: 'Social Media Marketing' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'influencer_collaboration', label: 'Influencer Collaboration' },
  { value: 'user_generated_content', label: 'User Generated Content' },
  { value: 'event_promotion', label: 'Event Promotion' },
  { value: 'community_building', label: 'Community Building' },
  { value: 'reviews_testimonials', label: 'Reviews & Testimonials' },
  { value: 'field_activation', label: 'Field Activation' },
  { value: 'in_store_promotion', label: 'In-Store Promotion' },
  { value: 'product_sampling', label: 'Product Sampling' },
  { value: 'street_marketing', label: 'Street Marketing' },
];
