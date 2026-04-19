-- Track which trial lifecycle emails have been sent so the daily job is idempotent.
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS trial_warning_3d_sent_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_expired_email_sent_at TIMESTAMPTZ;
