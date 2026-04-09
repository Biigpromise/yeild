
-- 1. FIX: user_roles privilege escalation
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- 2. FIX: profiles public data exposure
DROP POLICY IF EXISTS "Profile access policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 3. FIX: task-evidence storage public read
DROP POLICY IF EXISTS "Allow public read access on task-evidence bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view task evidence" ON storage.objects;

CREATE POLICY "Authenticated users can view task evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'task-evidence');
