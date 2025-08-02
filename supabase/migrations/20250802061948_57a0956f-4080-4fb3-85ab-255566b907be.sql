-- First, let's check the exact RLS policies that exist
DO $$
BEGIN
    -- Drop and recreate task_submissions policies
    DROP POLICY IF EXISTS "Admins can view all task submissions" ON public.task_submissions;
    DROP POLICY IF EXISTS "Admins can update task submissions" ON public.task_submissions;
    
    -- Create comprehensive admin policies for task_submissions
    CREATE POLICY "Admins can manage all task submissions" 
    ON public.task_submissions 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

    -- Drop and recreate brand_campaigns policies  
    DROP POLICY IF EXISTS "Admins can view all brand campaigns" ON public.brand_campaigns;
    DROP POLICY IF EXISTS "Admins can update all brand campaigns" ON public.brand_campaigns;
    DROP POLICY IF EXISTS "Admins can delete all brand campaigns" ON public.brand_campaigns;
    
    -- Create comprehensive admin policies for brand_campaigns
    CREATE POLICY "Admins can manage all brand campaigns" 
    ON public.brand_campaigns 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
    
    RAISE NOTICE 'Admin RLS policies have been reset and recreated successfully.';
END $$;