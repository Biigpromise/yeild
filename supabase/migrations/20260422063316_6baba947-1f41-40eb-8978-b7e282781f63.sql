-- 1. Fix messages: remove broad read policy
DROP POLICY IF EXISTS "Users can read messages" ON public.messages;

-- 2. Fix fraud/audit/image tables: restrict INSERT to service_role
DROP POLICY IF EXISTS "Service can insert fraud flags" ON public.fraud_flags;
CREATE POLICY "Service role can insert fraud flags"
ON public.fraud_flags FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert fraud detection logs" ON public.fraud_detection_logs;
DROP POLICY IF EXISTS "Service can insert fraud detection logs" ON public.fraud_detection_logs;
CREATE POLICY "Service role can insert fraud detection logs"
ON public.fraud_detection_logs FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert verification logs" ON public.verification_logs;
CREATE POLICY "Service role can insert verification logs"
ON public.verification_logs FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "Service role can insert activity logs"
ON public.user_activity_logs FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert image hashes" ON public.image_hashes;
CREATE POLICY "Service role can insert image hashes"
ON public.image_hashes FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert global image usage" ON public.global_image_usage;
CREATE POLICY "Service role can insert global image usage"
ON public.global_image_usage FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert duplicate flags" ON public.duplicate_image_flags;
CREATE POLICY "Service role can insert duplicate flags"
ON public.duplicate_image_flags FOR INSERT TO service_role WITH CHECK (true);

-- 3. Fix user_achievements: restrict INSERT to service_role
DROP POLICY IF EXISTS "System can insert achievements" ON public.user_achievements;
CREATE POLICY "Service role can insert achievements"
ON public.user_achievements FOR INSERT TO service_role WITH CHECK (true);

-- 4. Fix realtime channel authorization
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to scoped channels" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to scoped channels"
ON realtime.messages FOR SELECT TO authenticated
USING (
  -- User's own channel: user:{auth.uid()}
  realtime.topic() = 'user:' || auth.uid()::text
  -- Brand notifications: brand:{user_id} where user owns brand
  OR (realtime.topic() LIKE 'brand:%' 
      AND substring(realtime.topic() from 7) = auth.uid()::text)
  -- Direct chat channels: chat:{chat_id} where user is participant
  OR (realtime.topic() LIKE 'chat:%' 
      AND EXISTS (
        SELECT 1 FROM public.direct_chat_participants
        WHERE chat_id::text = substring(realtime.topic() from 6)
          AND user_id = auth.uid()
      ))
  OR (realtime.topic() LIKE 'chat:%' 
      AND EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_id::text = substring(realtime.topic() from 6)
          AND user_id = auth.uid()
      ))
  -- Public community channels (community chat, posts feed)
  OR realtime.topic() IN ('community_messages', 'public_feed', 'posts')
  OR realtime.topic() LIKE 'community_%'
  -- Admin channels: only admins
  OR (realtime.topic() LIKE 'admin%' AND public.is_admin_safe(auth.uid()))
);

-- Allow authenticated users to send presence/broadcast on channels they can read
DROP POLICY IF EXISTS "Authenticated users can broadcast on allowed channels" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast on allowed channels"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (
  realtime.topic() = 'user:' || auth.uid()::text
  OR realtime.topic() IN ('community_messages', 'public_feed', 'posts')
  OR realtime.topic() LIKE 'community_%'
  OR (realtime.topic() LIKE 'chat:%' 
      AND EXISTS (
        SELECT 1 FROM public.direct_chat_participants
        WHERE chat_id::text = substring(realtime.topic() from 6)
          AND user_id = auth.uid()
      ))
  OR (realtime.topic() LIKE 'chat:%' 
      AND EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_id::text = substring(realtime.topic() from 6)
          AND user_id = auth.uid()
      ))
);

-- 5. Fix platform_settings: scope public read to safe keys only
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Authenticated users can read public platform settings" ON public.platform_settings;

CREATE POLICY "Anyone can read public platform settings"
ON public.platform_settings FOR SELECT
USING (key IN ('siteName', 'maintenanceMode', 'registrationEnabled'));

CREATE POLICY "Admins can read all platform settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (public.is_admin_safe(auth.uid()));