-- Relax brand_campaigns status check constraint to support workflow statuses used in code
ALTER TABLE public.brand_campaigns
  DROP CONSTRAINT IF EXISTS brand_campaigns_status_check;

ALTER TABLE public.brand_campaigns
  ADD CONSTRAINT brand_campaigns_status_check
  CHECK (status = ANY (ARRAY[
    'draft'::text,
    'active'::text,
    'paused'::text,
    'completed'::text,
    'cancelled'::text,
    'pending_approval'::text,
    'rejected'::text,
    'refunded'::text
  ]));