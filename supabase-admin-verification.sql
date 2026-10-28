-- ============================================================
-- Admin one-time access code + profiles privilege hardening
-- Run this in Supabase -> SQL Editor
-- ============================================================

-- 1. Pending admin verifications.
--    A row with verified_at = NULL means "this admin still owes us a code".
--    No RLS policies are defined on purpose: with RLS on and zero policies,
--    only the service role (which bypasses RLS) can read or write this table.
CREATE TABLE IF NOT EXISTS public.admin_verification (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_verification ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS admin_verification_pending_idx
  ON public.admin_verification (user_id)
  WHERE verified_at IS NULL;

-- 2. CRITICAL, unrelated to the feature but found while building it:
--    the profiles UPDATE policy is "auth.uid() = id" with no column
--    restriction, so any signed-in customer can run
--        supabase.from('profiles').update({ role: 'admin' }).eq('id', me)
--    from the browser console and promote themselves. Revoke the blanket
--    UPDATE and grant back only the columns the app actually edits.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (first_name, last_name, company, updated_at)
  ON public.profiles TO authenticated;

-- 3. Same problem on INSERT: the policy only checks ownership, not the role
--    being written.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND role = 'customer');
