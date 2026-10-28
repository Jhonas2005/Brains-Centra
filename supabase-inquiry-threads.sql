-- ============================================================
-- Customer request threads
-- Run this in Supabase -> SQL Editor
-- ============================================================

-- Every inbound and outbound message on an inquiry, in order.
-- inquiry_id is TEXT (not a FK) because the inquiries.id column type is not
-- defined in this repo; TEXT works whether it is a uuid or a bigint.
CREATE TABLE IF NOT EXISTS public.inquiry_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id  TEXT NOT NULL,
  direction   TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject     TEXT,
  body        TEXT NOT NULL,
  from_email  TEXT,
  to_email    TEXT,
  sent_by     TEXT,
  message_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiry_messages_thread_idx
  ON public.inquiry_messages (inquiry_id, created_at);

-- Same rule as admin_verification: RLS on, zero policies, so only the
-- service role can read or write. Customers must never see internal notes.
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;

-- Prevent the same inbound email being stored twice if the provider retries.
CREATE UNIQUE INDEX IF NOT EXISTS inquiry_messages_message_id_idx
  ON public.inquiry_messages (message_id)
  WHERE message_id IS NOT NULL;
