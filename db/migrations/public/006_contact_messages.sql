CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'contact_form',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  topic TEXT,
  subject TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  resend_email_id TEXT,
  to_emails JSONB,
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_messages_source_idx
  ON contact_messages (source);

CREATE INDEX IF NOT EXISTS contact_messages_status_idx
  ON contact_messages (status);

