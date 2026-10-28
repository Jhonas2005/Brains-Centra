-- ============================================================
-- Password change verification
-- Run this in Supabase -> SQL Editor
-- ============================================================

-- Holds a password change that has been requested but NOT yet applied.
-- The new password is encrypted with AES-256-GCM (see src/lib/passwordChange.js)
-- and is only decrypted after the emailed code is verified.
-- No RLS policies on purpose: only the service role can touch this table.
CREATE TABLE IF NOT EXISTS public.password_change_verification (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash       TEXT NOT NULL,
  pending_secret  JSONB NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.password_change_verification ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS password_change_verification_expiry_idx
  ON public.password_change_verification (expires_at);
