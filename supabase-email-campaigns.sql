-- ============================================================
-- Email campaigns (admin -> customers / prospects)
-- Run this in Supabase -> SQL Editor
-- ============================================================

-- One row per blast. Recipients live in the child table so a campaign can be
-- resumed if a batch fails halfway through.
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  image_urls      JSONB NOT NULL DEFAULT '[]'::jsonb,
  audience        TEXT NOT NULL,                      -- customers | prospects | all | custom
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count      INTEGER NOT NULL DEFAULT 0,
  failed_count    INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'sending'
                  CHECK (status IN ('sending', 'sent', 'cancelled', 'failed')),
  created_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  kind        TEXT,                                   -- customer | prospect
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error       TEXT,
  sent_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS email_campaign_recipients_queue_idx
  ON public.email_campaign_recipients (campaign_id, status);

-- Opt-outs. Checked before every send, and the audience queries exclude them.
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  email      TEXT PRIMARY KEY,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Same rule as admin_verification / inquiry_messages: RLS on, zero policies,
-- so only the service role can read or write. Customers must never see the
-- list of everyone we market to.
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Storage bucket for images embedded in campaign emails.
-- Public read so the images render in the recipient's inbox.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read email assets" ON storage.objects;
CREATE POLICY "Public read email assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');
