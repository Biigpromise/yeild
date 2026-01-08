-- =============================================
-- YEILD CORE PLATFORM SCHEMA
-- Managed Human Execution Platform
-- =============================================

-- Platform Constants (Settings)
CREATE TABLE public.platform_constants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_constants ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify constants
CREATE POLICY "Admins can view platform constants"
  ON public.platform_constants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update platform constants"
  ON public.platform_constants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert platform constants
INSERT INTO public.platform_constants (key, value, description) VALUES
  ('platform_fee_percent', 35.00, 'Platform management fee percentage on all execution orders'),
  ('min_payout_threshold', 1000, 'Minimum execution credits required for withdrawal'),
  ('payout_hold_days', 7, 'Days to hold verified execution credits before release'),
  ('random_sample_percent', 10, 'Percentage of executions randomly selected for manual review'),
  ('rank_decay_inactive_days', 30, 'Days of inactivity before rank decay begins');

-- =============================================
-- OPERATOR CLEARANCE RANKS
-- =============================================

CREATE TABLE public.operator_ranks (
  id SERIAL PRIMARY KEY,
  rank_level INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  min_verified_executions INTEGER NOT NULL DEFAULT 0,
  min_success_rate NUMERIC NOT NULL DEFAULT 0,
  allowed_template_codes TEXT[] NOT NULL DEFAULT '{}',
  decay_rate_percent NUMERIC NOT NULL DEFAULT 15,
  penalty_multiplier NUMERIC NOT NULL DEFAULT 1,
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.operator_ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view operator ranks"
  ON public.operator_ranks FOR SELECT
  USING (true);

-- Insert operator ranks (aligned with YEILD spec)
INSERT INTO public.operator_ranks (rank_level, name, emoji, icon, color, description, min_verified_executions, min_success_rate, allowed_template_codes, decay_rate_percent, penalty_multiplier, benefits) VALUES
  (1, 'Dove', '🕊️', 'Bird', '#9CA3AF', 'Entry-level operator. Access to basic social executions only.', 0, 0, ARRAY['EO-001'], 15, 1.0, ARRAY['Access to EO-001 (Social Placement)', 'Standard verification times']),
  (2, 'Hawk', '🦅', 'Bird', '#3B82F6', 'Proven operator. Expanded execution access.', 10, 80, ARRAY['EO-001', 'EO-003'], 12, 1.5, ARRAY['Access to EO-001, EO-003', 'Priority support']),
  (3, 'Eagle', '🦅', 'Bird', '#8B5CF6', 'Trusted operator. Full digital execution access.', 50, 85, ARRAY['EO-001', 'EO-003', 'EO-004', 'EO-006'], 10, 2.0, ARRAY['Access to all digital EOs', 'Faster verification', 'Higher value orders']),
  (4, 'Falcon', '🦅', 'Bird', '#F59E0B', 'Elite operator. Offline execution cleared.', 150, 90, ARRAY['EO-001', 'EO-002', 'EO-003', 'EO-004', 'EO-006'], 8, 2.5, ARRAY['Offline execution access', 'Premium order priority', 'Dedicated support']),
  (5, 'Phoenix', '🔥', 'Flame', '#EF4444', 'Audit-level operator. Highest trust clearance.', 500, 95, ARRAY['EO-001', 'EO-002', 'EO-003', 'EO-004', 'EO-006', 'AUDIT'], 5, 3.0, ARRAY['All execution types', 'Audit & pilot access', 'VIP treatment']);

-- =============================================
-- EXECUTION ORDER TEMPLATES (YEILD-Defined Only)
-- =============================================

CREATE TABLE public.execution_order_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  action_definition TEXT NOT NULL,
  required_proof_types TEXT[] NOT NULL,
  verification_window_hours INTEGER NOT NULL DEFAULT 24,
  difficulty_level TEXT NOT NULL DEFAULT 'standard' CHECK (difficulty_level IN ('basic', 'standard', 'priority', 'high-value', 'audit')),
  base_credit_value INTEGER NOT NULL DEFAULT 100,
  min_rank_level INTEGER NOT NULL DEFAULT 1 REFERENCES public.operator_ranks(rank_level),
  failure_penalty_rules JSONB DEFAULT '{}',
  auto_reject_criteria JSONB DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  requires_manual_verification BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.execution_order_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled templates"
  ON public.execution_order_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON public.execution_order_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert V1 Execution Order Templates
INSERT INTO public.execution_order_templates (code, name, description, action_definition, required_proof_types, verification_window_hours, difficulty_level, base_credit_value, min_rank_level, is_enabled, requires_manual_verification, icon, category) VALUES
  ('EO-001', 'Verified Social Placement', 'Post brand-provided content on a specified social platform with exact caption and media.', 'Post the provided content on your social media account. Exact caption and media must be used. Content must remain live for the specified duration.', ARRAY['screenshot', 'public_url'], 24, 'standard', 150, 1, true, false, 'Share2', 'social'),
  ('EO-002', 'Offline/Real-World Execution', 'Complete a physical task at a specific location within a strict time window.', 'Visit the specified location during the required time window. Complete the assigned action and capture geo-tagged photo proof with visible timestamp.', ARRAY['geo_photo', 'timestamp_verification'], 48, 'high-value', 500, 4, false, true, 'MapPin', 'offline'),
  ('EO-003', 'App Install + Activation', 'Install an app and complete the required in-app action with screenshot proof.', 'Download and install the specified app. Complete the required in-app action (e.g., registration, first purchase). Capture screenshot of confirmation screen.', ARRAY['screenshot', 'device_verification'], 24, 'standard', 200, 1, true, false, 'Smartphone', 'app'),
  ('EO-004', 'Website Action', 'Complete a specific action on a website and provide confirmation proof.', 'Visit the specified website. Complete the required action (signup, form submission, etc.). Capture the confirmation page or submission ID.', ARRAY['screenshot', 'confirmation_id'], 24, 'basic', 100, 1, true, false, 'Globe', 'web'),
  ('EO-006', 'Survey/Data Collection', 'Complete a survey or provide requested data with proof of submission.', 'Complete the provided survey or data collection form. Submit all required fields. Capture confirmation of successful submission.', ARRAY['screenshot', 'submission_confirmation'], 48, 'basic', 75, 1, true, false, 'ClipboardList', 'survey');

-- =============================================
-- EXECUTION ORDERS (Brand Instances)
-- =============================================

CREATE TABLE public.execution_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.execution_order_templates(id),
  brand_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.brand_campaigns(id),
  title TEXT NOT NULL,
  custom_instructions TEXT,
  required_platform TEXT,
  required_media_urls TEXT[],
  required_caption TEXT,
  target_quantity INTEGER NOT NULL DEFAULT 1,
  completed_quantity INTEGER NOT NULL DEFAULT 0,
  verification_window_hours INTEGER NOT NULL DEFAULT 24,
  operator_payout INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  brand_total_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'cancelled')),
  admin_approval_status TEXT DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_costs CHECK (brand_total_cost = operator_payout + platform_fee)
);

ALTER TABLE public.execution_orders ENABLE ROW LEVEL SECURITY;

-- Brands can see their own orders
CREATE POLICY "Brands can view own execution orders"
  ON public.execution_orders FOR SELECT
  USING (brand_id = auth.uid());

CREATE POLICY "Brands can create execution orders"
  ON public.execution_orders FOR INSERT
  WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Brands can update own draft orders"
  ON public.execution_orders FOR UPDATE
  USING (brand_id = auth.uid() AND status = 'draft');

-- Operators can view active orders they qualify for
CREATE POLICY "Operators can view active orders"
  ON public.execution_orders FOR SELECT
  USING (
    status = 'active' 
    AND admin_approval_status = 'approved'
    AND (expires_at IS NULL OR expires_at > now())
    AND completed_quantity < target_quantity
  );

-- Admins can manage all orders
CREATE POLICY "Admins can manage all execution orders"
  ON public.execution_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- EXECUTION SUBMISSIONS
-- =============================================

CREATE TABLE public.execution_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.execution_orders(id),
  operator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_auto' CHECK (status IN ('pending_auto', 'pending_review', 'verified', 'rejected', 'disputed')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_started_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  rejection_category TEXT,
  credits_earned INTEGER,
  credits_released_at TIMESTAMP WITH TIME ZONE,
  is_first_execution BOOLEAN NOT NULL DEFAULT false,
  is_random_sample BOOLEAN NOT NULL DEFAULT false,
  device_fingerprint TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_operator_order UNIQUE (order_id, operator_id)
);

ALTER TABLE public.execution_submissions ENABLE ROW LEVEL SECURITY;

-- Operators can see their own submissions
CREATE POLICY "Operators can view own submissions"
  ON public.execution_submissions FOR SELECT
  USING (operator_id = auth.uid());

CREATE POLICY "Operators can create submissions"
  ON public.execution_submissions FOR INSERT
  WITH CHECK (operator_id = auth.uid());

-- Brands can see submissions for their orders (limited fields via view)
CREATE POLICY "Brands can view order submissions"
  ON public.execution_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.execution_orders
      WHERE id = order_id AND brand_id = auth.uid()
    )
  );

-- Admins/Verifiers can manage submissions
CREATE POLICY "Admins can manage all submissions"
  ON public.execution_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'verifier')
    )
  );

-- =============================================
-- EXECUTION PROOFS
-- =============================================

CREATE TABLE public.execution_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.execution_submissions(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('screenshot', 'public_url', 'video', 'geo_photo', 'confirmation_id', 'submission_confirmation', 'device_verification', 'timestamp_verification')),
  file_url TEXT,
  external_url TEXT,
  metadata JSONB DEFAULT '{}',
  file_hash TEXT,
  auto_validation_status TEXT DEFAULT 'pending' CHECK (auto_validation_status IN ('pending', 'passed', 'failed', 'flagged')),
  auto_validation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.execution_proofs ENABLE ROW LEVEL SECURITY;

-- Operators can see their own proofs
CREATE POLICY "Operators can view own proofs"
  ON public.execution_proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.execution_submissions
      WHERE id = submission_id AND operator_id = auth.uid()
    )
  );

CREATE POLICY "Operators can upload proofs"
  ON public.execution_proofs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.execution_submissions
      WHERE id = submission_id AND operator_id = auth.uid()
    )
  );

-- Admins/Verifiers can manage proofs
CREATE POLICY "Admins can manage all proofs"
  ON public.execution_proofs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'verifier')
    )
  );

-- =============================================
-- VERIFICATION QUEUE
-- =============================================

CREATE TABLE public.verification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.execution_submissions(id) ON DELETE CASCADE,
  queue_type TEXT NOT NULL CHECK (queue_type IN ('auto_flagged', 'first_execution', 'high_value', 'random_sample', 'dispute')),
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  assigned_to UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'escalated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.verification_queue ENABLE ROW LEVEL SECURITY;

-- Only admins/verifiers can access queue
CREATE POLICY "Admins can manage verification queue"
  ON public.verification_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'verifier')
    )
  );

-- =============================================
-- VERIFICATION LOGS (Audit Trail)
-- =============================================

CREATE TABLE public.verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.execution_submissions(id),
  action TEXT NOT NULL,
  performed_by UUID,
  performed_by_type TEXT NOT NULL CHECK (performed_by_type IN ('system', 'admin', 'verifier')),
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view verification logs"
  ON public.verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert verification logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (true);

-- =============================================
-- OPERATOR RANK HISTORY
-- =============================================

CREATE TABLE public.operator_rank_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL,
  previous_rank_level INTEGER REFERENCES public.operator_ranks(rank_level),
  new_rank_level INTEGER NOT NULL REFERENCES public.operator_ranks(rank_level),
  change_reason TEXT NOT NULL CHECK (change_reason IN ('promotion', 'demotion', 'decay', 'fraud_penalty', 'initial')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_rank_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own rank history"
  ON public.operator_rank_history FOR SELECT
  USING (operator_id = auth.uid());

CREATE POLICY "Admins can manage rank history"
  ON public.operator_rank_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- OPERATOR STATS (Add to profiles or separate table)
-- =============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS operator_rank_level INTEGER DEFAULT 1 REFERENCES public.operator_ranks(rank_level),
ADD COLUMN IF NOT EXISTS verified_executions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_executions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_success_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_execution_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rank_decay_paused_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS execution_credits_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_credits_pending INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_credits_lifetime INTEGER DEFAULT 0;

-- =============================================
-- BRAND QUALIFICATION
-- =============================================

CREATE TABLE public.brand_qualification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  country TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('startup', 'sme', 'digital_product', 'fintech', 'ecommerce', 'saas', 'local_service', 'utility', 'other')),
  accepted_execution_rules BOOLEAN NOT NULL DEFAULT false,
  accepted_verification_delays BOOLEAN NOT NULL DEFAULT false,
  accepted_no_direct_contact BOOLEAN NOT NULL DEFAULT false,
  accepted_yeild_authority BOOLEAN NOT NULL DEFAULT false,
  qualification_status TEXT NOT NULL DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'rejected', 'suspended')),
  qualified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_qualification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view own qualification"
  ON public.brand_qualification FOR SELECT
  USING (brand_id = auth.uid());

CREATE POLICY "Brands can insert own qualification"
  ON public.brand_qualification FOR INSERT
  WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Brands can update own qualification"
  ON public.brand_qualification FOR UPDATE
  USING (brand_id = auth.uid());

CREATE POLICY "Admins can manage qualifications"
  ON public.brand_qualification FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- FORBIDDEN KEYWORDS (For validation)
-- =============================================

CREATE TABLE public.forbidden_task_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forbidden_task_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forbidden keywords"
  ON public.forbidden_task_keywords FOR SELECT
  USING (true);

-- Insert forbidden keywords
INSERT INTO public.forbidden_task_keywords (keyword, reason) VALUES
  ('likes', 'Engagement farming forbidden'),
  ('like', 'Engagement farming forbidden'),
  ('follows', 'Engagement farming forbidden'),
  ('follow', 'Engagement farming forbidden'),
  ('followers', 'Engagement farming forbidden'),
  ('subscriber', 'Engagement farming forbidden'),
  ('subscribers', 'Engagement farming forbidden'),
  ('subscribe', 'Engagement farming forbidden'),
  ('watch', 'Passive viewing forbidden'),
  ('views', 'Impression farming forbidden'),
  ('view', 'Impression farming forbidden'),
  ('impressions', 'Impression farming forbidden'),
  ('engagement', 'Engagement farming forbidden'),
  ('reach', 'Exposure promises forbidden'),
  ('exposure', 'Exposure promises forbidden'),
  ('viral', 'Virality promises forbidden'),
  ('trending', 'Trending manipulation forbidden');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_execution_orders_brand ON public.execution_orders(brand_id);
CREATE INDEX idx_execution_orders_status ON public.execution_orders(status);
CREATE INDEX idx_execution_orders_template ON public.execution_orders(template_id);
CREATE INDEX idx_execution_submissions_order ON public.execution_submissions(order_id);
CREATE INDEX idx_execution_submissions_operator ON public.execution_submissions(operator_id);
CREATE INDEX idx_execution_submissions_status ON public.execution_submissions(status);
CREATE INDEX idx_execution_proofs_submission ON public.execution_proofs(submission_id);
CREATE INDEX idx_verification_queue_status ON public.verification_queue(status);
CREATE INDEX idx_operator_rank_history_operator ON public.operator_rank_history(operator_id);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_platform_constants_updated_at
  BEFORE UPDATE ON public.platform_constants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operator_ranks_updated_at
  BEFORE UPDATE ON public.operator_ranks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_execution_order_templates_updated_at
  BEFORE UPDATE ON public.execution_order_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_execution_orders_updated_at
  BEFORE UPDATE ON public.execution_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_execution_submissions_updated_at
  BEFORE UPDATE ON public.execution_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_qualification_updated_at
  BEFORE UPDATE ON public.brand_qualification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();