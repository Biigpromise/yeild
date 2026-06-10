
-- 1. execution_submissions: hide operator IP/device from brands via column privileges
REVOKE SELECT (ip_address, device_fingerprint) ON public.execution_submissions FROM authenticated, anon;

-- 2. profiles: replace spoofable JWT-claim service_role policy
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
-- service_role bypasses RLS by default; no replacement policy required.

-- 3. user_referrals: remove overly-broad public INSERT/UPDATE policies
DROP POLICY IF EXISTS "Service can insert referrals" ON public.user_referrals;
DROP POLICY IF EXISTS "Service can update referrals" ON public.user_referrals;
DROP POLICY IF EXISTS "Allow referral signup" ON public.user_referrals;
-- The remaining "Users can create own referrals" and "Users can update own referrals"
-- (scoped to authenticated + auth.uid()) cover legitimate flows.

-- 4. messages: drop overly broad insert policy that bypasses participant check
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

-- 5. user_signup_data: require authenticated self-insert
DROP POLICY IF EXISTS "Service can insert signup data" ON public.user_signup_data;
CREATE POLICY "Users can insert own signup data"
  ON public.user_signup_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 6. task-evidence storage: restrict reads/writes to owners + admins
DROP POLICY IF EXISTS "Authenticated users can view task evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to task-evidence bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own task evidence" ON storage.objects;

CREATE POLICY "Task evidence: owner or admin can read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'task-evidence'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.is_admin_safe(auth.uid())
    )
  );

CREATE POLICY "Task evidence: owner can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'task-evidence'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Task evidence: owner can update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'task-evidence'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Task evidence: owner can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'task-evidence'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 7. campaign-media: consolidate to folder-scoped policies
DROP POLICY IF EXISTS "Authenticated users can upload campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Brands can delete their own campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Brands can update their own campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Brands can upload campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their campaign media" ON storage.objects;
-- Keep the folder-scoped "Brands can upload their campaign media" and "Brands can view their campaign media".
-- Add folder-scoped update/delete.
CREATE POLICY "Campaign media: owner can update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'campaign-media'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Campaign media: owner can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'campaign-media'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 8. chat-images: add folder-ownership
DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete chat images" ON storage.objects;
CREATE POLICY "Chat images: owner can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Chat images: owner can update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Chat images: owner can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 9. chat-media: require participant on upload
DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;
CREATE POLICY "Chat media: participants can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media'
    AND (
      EXISTS (
        SELECT 1 FROM public.direct_chat_participants dcp
        WHERE dcp.chat_id::text = (storage.foldername(name))[1]
          AND dcp.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.chat_participants cp
        WHERE cp.chat_id::text = (storage.foldername(name))[1]
          AND cp.user_id = auth.uid()
      )
    )
  );

-- 10. voice-messages: enforce folder ownership
DROP POLICY IF EXISTS "Users can upload their own voice messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own voice messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own voice messages" ON storage.objects;
CREATE POLICY "Voice messages: owner can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-messages'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Voice messages: owner can update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'voice-messages'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Voice messages: owner can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'voice-messages'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
