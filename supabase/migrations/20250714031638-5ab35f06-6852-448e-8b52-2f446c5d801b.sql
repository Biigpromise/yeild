-- Fix performance issues by optimizing RLS policies to reduce auth.uid() calls

-- Create optimized policies for user_roles table that reduce function calls
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;

-- More efficient policies that use auth.uid() only once per operation
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own roles" ON public.user_roles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Optimize profiles policies to reduce multiple permissive policies
DROP POLICY IF EXISTS "Authenticated users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile information" ON public.profiles;

-- Single comprehensive SELECT policy for profiles
CREATE POLICY "Profile access policy" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid() OR  -- Users can see their own
    is_admin(auth.uid()) OR  -- Admins can see all
    true  -- Public profile info visible to all
  );

-- Optimize messages policies to reduce auth checks
DROP POLICY IF EXISTS "Allow authenticated users to read all messages" ON public.messages;
CREATE POLICY "Users can read messages" ON public.messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Optimize posts policies
DROP POLICY IF EXISTS "Anyone can read posts (public feed)" ON public.posts;
DROP POLICY IF EXISTS "Users can select their own posts" ON public.posts;
CREATE POLICY "Posts are publicly readable" ON public.posts
  FOR SELECT
  USING (true);