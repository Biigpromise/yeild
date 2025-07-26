-- Phase 1: Security Fixes and Performance Optimization
-- The function search path fix was already applied successfully

-- Add missing constraints (without IF NOT EXISTS)
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
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_followers_count_non_negative') THEN
        ALTER TABLE profiles ADD CONSTRAINT check_followers_count_non_negative CHECK (followers_count >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_following_count_non_negative') THEN
        ALTER TABLE profiles ADD CONSTRAINT check_following_count_non_negative CHECK (following_count >= 0);
    END IF;
    
    -- Add constraints for brand wallets
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_balance_non_negative') THEN
        ALTER TABLE brand_wallets ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_deposited_non_negative') THEN
        ALTER TABLE brand_wallets ADD CONSTRAINT check_total_deposited_non_negative CHECK (total_deposited >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_spent_non_negative') THEN
        ALTER TABLE brand_wallets ADD CONSTRAINT check_total_spent_non_negative CHECK (total_spent >= 0);
    END IF;
    
    -- Add constraints for campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_budget_positive') THEN
        ALTER TABLE brand_campaigns ADD CONSTRAINT check_budget_positive CHECK (budget > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_funded_amount_non_negative') THEN
        ALTER TABLE brand_campaigns ADD CONSTRAINT check_funded_amount_non_negative CHECK (funded_amount >= 0);
    END IF;
END $$;

-- Phase 2: Critical Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

-- Optimize messages table (high activity)
CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Optimize profiles table for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_points_desc ON profiles(points DESC) WHERE points > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_tasks_completed ON profiles(tasks_completed DESC) WHERE tasks_completed > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_name_points ON profiles(name, points DESC) WHERE name IS NOT NULL AND name != '';

-- Optimize task-related queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id_status ON task_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id_status ON task_submissions(task_id, status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status_submitted_at ON task_submissions(status, submitted_at DESC);

-- Optimize user_roles queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);

-- Optimize brand campaigns
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_brand_id_created_at ON brand_campaigns(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_status ON brand_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_admin_approval_status ON brand_campaigns(admin_approval_status) WHERE admin_approval_status = 'pending';

-- Optimize user referrals
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer_active ON user_referrals(referrer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_active ON user_referrals(referred_id, is_active);

-- Optimize brand wallets and transactions
CREATE INDEX IF NOT EXISTS idx_brand_wallet_transactions_brand_id_created_at ON brand_wallet_transactions(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_wallet_transactions_transaction_type ON brand_wallet_transactions(transaction_type);

-- Optimize admin notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read_created_at ON admin_notifications(is_read, created_at DESC);

-- Optimize achievement and reward queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id_created_at ON reward_redemptions(user_id, created_at DESC);

-- Additional performance indexes for high-traffic operations
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id_user_id ON post_views(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id_user_id ON post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id_user_id ON comment_likes(comment_id, user_id);

-- Create monitoring view for performance tracking
CREATE OR REPLACE VIEW public.performance_monitor AS
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  CASE 
    WHEN (seq_scan + idx_scan) > 0 
    THEN ROUND((seq_scan::numeric / (seq_scan + idx_scan)::numeric) * 100, 2)
    ELSE 0 
  END as seq_scan_percentage
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan_percentage DESC;