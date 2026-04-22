
-- 1. Fix point_transactions: remove permissive INSERT, allow only service_role
DROP POLICY IF EXISTS "System can insert transactions" ON public.point_transactions;

CREATE POLICY "Service role can insert point transactions"
ON public.point_transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Fix chat-media bucket: restrict SELECT to authenticated chat participants
DROP POLICY IF EXISTS "Anyone can view chat media" ON storage.objects;

CREATE POLICY "Chat participants can view chat media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-media'
  AND (
    -- Path convention: {chat_id}/... — verify user is a participant
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

-- 3. Fix execution_order_templates: only show enabled templates
DROP POLICY IF EXISTS "Anyone can view enabled templates" ON public.execution_order_templates;

CREATE POLICY "Anyone can view enabled templates"
ON public.execution_order_templates
FOR SELECT
USING (is_enabled = true);

-- Allow admins to view all templates (including disabled)
DROP POLICY IF EXISTS "Admins can view all templates" ON public.execution_order_templates;
CREATE POLICY "Admins can view all templates"
ON public.execution_order_templates
FOR SELECT
TO authenticated
USING (public.is_admin_safe(auth.uid()));
