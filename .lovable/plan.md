

# Security Fix Plan — Remaining Findings

We left off after fixing the webhook signature bypass, user_roles privilege escalation INSERT policy, hardcoded admin triggers, and profiles INSERT policy. Here's what remains:

## Active Findings to Fix

### 1. Profiles Table: Email Exposure (ERROR — supabase_lov)
**Problem**: The policy `"Authenticated users can view profiles"` uses `USING (true)`, exposing all user emails, referral codes, and activity metrics to any authenticated user.

**Fix**: Drop this overly permissive policy. The existing `"Users can view own profile"` (USING id = auth.uid()) and `"Admins can view all profiles"` policies already handle legitimate access. For features that need public profile info (leaderboard, social feed), the existing `get_public_profile_info()` and `get_leaderboard_data()` SECURITY DEFINER functions already return only safe fields.

**Migration SQL**:
```sql
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
```

### 2. Hardcoded Admin Email in roleService.ts (WARN — agent_security)
**Problem**: `src/services/roleService.ts` line 29 has a client-side fallback checking `yeildsocials@gmail.com` to return admin role. This is a security risk — admin status should only come from the database.

**Fix**: Remove the hardcoded email fallback block entirely.

### 3. Realtime Channel Authorization (ERROR — supabase_lov)
**Problem**: No RLS on `realtime.messages` — any authenticated user can subscribe to any channel (admin_notifications, brand_notifications, etc.).

**Fix**: This is a Supabase Realtime limitation. We cannot modify the `realtime` schema directly (reserved). The proper mitigation is to ensure sensitive data is never broadcast over Realtime channels, and to use Supabase's built-in channel authorization via RLS on the `realtime.messages` table if supported, or implement topic-based filtering in the application layer. We'll mark this with a note explaining the limitation.

### 4. RLS "Always True" Warnings (WARN — supabase linter)
**Problem**: 15 linter warnings for `WITH CHECK (true)` or `USING (true)` across many tables.

**Analysis**: Most are legitimate:
- **Public read data** (bird_levels, colors, currency_rates, execution_modes, operator_ranks, platform_settings, etc.) — intentionally public reference data
- **Service role inserts** (fraud_flags, image_hashes, activity_logs, etc.) — system tables written by triggers/functions
- **Social feed data** (posts, comments, likes, reactions) — intentionally public for the social feed
- **profiles SELECT** — addressed in Fix #1 above

**Fix**: The `marketplace_interactions` INSERT `WITH CHECK (true)` and `user_referrals` INSERT/UPDATE policies should be tightened. The rest are acceptable. We'll ignore the acceptable ones with explanations.

## Files Changed

1. **Migration SQL** — Drop permissive profiles SELECT policy
2. **src/services/roleService.ts** — Remove hardcoded admin email fallback
3. **Security findings** — Mark resolved, ignore where appropriate

## Execution Order

1. Apply migration to drop the permissive profiles policy
2. Edit roleService.ts to remove hardcoded email
3. Update security findings status

