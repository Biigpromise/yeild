
-- Fix the database function security issues by adding proper RLS policies

-- Add RLS policies for profiles table if not already present
DO $$ 
BEGIN
    -- Check if profiles table has RLS enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles'
    ) THEN
        -- Enable RLS on profiles table
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Allow users to view their own profile
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
            
        -- Allow users to update their own profile
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
            
        -- Allow users to insert their own profile (for new user creation)
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Add RLS policies for point_transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'point_transactions'
    ) THEN
        ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own transactions" ON public.point_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_achievements table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements'
    ) THEN
        ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own achievements" ON public.user_achievements
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for reward_redemptions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reward_redemptions'
    ) THEN
        ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can create own redemptions" ON public.reward_redemptions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_roles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Allow users to view their own roles
        CREATE POLICY "Users can view own roles" ON public.user_roles
            FOR SELECT USING (auth.uid() = user_id);
            
        -- Allow admins to manage roles (using the has_role function)
        CREATE POLICY "Admins can manage roles" ON public.user_roles
            FOR ALL USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- Add RLS policies for user_tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_tasks'
    ) THEN
        ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own tasks" ON public.user_tasks
            FOR SELECT USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert own tasks" ON public.user_tasks
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update own tasks" ON public.user_tasks
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add public read access for reference tables
DO $$
BEGIN
    -- Task categories should be readable by all authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'task_categories'
    ) THEN
        ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view task categories" ON public.task_categories
            FOR SELECT TO authenticated USING (true);
    END IF;
    
    -- Tasks should be readable by all authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'tasks'
    ) THEN
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view active tasks" ON public.tasks
            FOR SELECT TO authenticated USING (status = 'active');
    END IF;
    
    -- Achievements should be readable by all authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'achievements'
    ) THEN
        ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view achievements" ON public.achievements
            FOR SELECT TO authenticated USING (is_active = true);
    END IF;
    
    -- Rewards should be readable by all authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'rewards'
    ) THEN
        ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view active rewards" ON public.rewards
            FOR SELECT TO authenticated USING (is_active = true);
    END IF;
END $$;

-- Fix the leaked password protection warning by ensuring proper access to auth functions
-- Grant proper permissions to authenticated users for the database functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_award_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
