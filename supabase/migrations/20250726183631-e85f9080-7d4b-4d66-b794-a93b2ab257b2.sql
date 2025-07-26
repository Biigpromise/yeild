-- Comprehensive Database Optimization (Final Implementation)

-- Add missing constraints for data integrity
DO $$ 
BEGIN 
    -- Add constraints for profiles table
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_points_non_negative') THEN
        ALTER TABLE profiles ADD CONSTRAINT check_points_non_negative CHECK (points >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_level_positive') THEN
        ALTER TABLE profiles ADD CONSTRAINT check_level_positive CHECK (level > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_tasks_completed_non_negative') THEN
        ALTER TABLE profiles ADD CONSTRAINT check_tasks_completed_non_negative CHECK (tasks_completed >= 0);
    END IF;
    
    -- Add constraints for brand wallets
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_balance_non_negative') THEN
        ALTER TABLE brand_wallets ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
    END IF;
    
    -- Add constraints for campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_budget_positive') THEN
        ALTER TABLE brand_campaigns ADD CONSTRAINT check_budget_positive CHECK (budget > 0);
    END IF;
END $$;

-- Critical Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_points_desc ON profiles(points DESC) WHERE points > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_tasks_completed ON profiles(tasks_completed DESC) WHERE tasks_completed > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_name_points ON profiles(name, points DESC) WHERE name IS NOT NULL AND name != '';

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_brand_campaigns_brand_id_created_at ON brand_campaigns(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_status ON brand_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_admin_approval_status ON brand_campaigns(admin_approval_status) WHERE admin_approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_brand_wallet_transactions_brand_id_created_at ON brand_wallet_transactions(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_wallet_transactions_transaction_type ON brand_wallet_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read_created_at ON admin_notifications(is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id_user_id ON post_views(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id_user_id ON post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id_user_id ON comment_likes(comment_id, user_id);

-- Create performance monitoring view with correct column names
CREATE OR REPLACE VIEW public.performance_monitor AS
SELECT 
  schemaname,
  relname as tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  CASE 
    WHEN (seq_scan + COALESCE(idx_scan, 0)) > 0 
    THEN ROUND((seq_scan::numeric / (seq_scan + COALESCE(idx_scan, 0))::numeric) * 100, 2)
    ELSE 0 
  END as seq_scan_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan_percentage DESC;

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE messages;
ANALYZE notifications;
ANALYZE brand_campaigns;
ANALYZE user_roles;
ANALYZE brand_wallet_transactions;
ANALYZE posts;
ANALYZE post_views;
ANALYZE post_likes;