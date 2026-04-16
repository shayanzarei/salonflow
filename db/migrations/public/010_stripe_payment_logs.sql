-- Audit trail for Stripe checkout and webhooks (super admin visibility)
CREATE TABLE IF NOT EXISTS stripe_payment_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  source              TEXT NOT NULL,
  event_type          TEXT NOT NULL,
  stripe_event_id     TEXT UNIQUE,
  checkout_session_id TEXT,
  payment_intent_id   TEXT,
  invoice_id          TEXT,
  customer_id         TEXT,
  subscription_id     TEXT,
  customer_email      TEXT,
  amount_cents        INTEGER,
  currency            TEXT,
  plan                TEXT,
  billing_cycle       TEXT,
  payment_status      TEXT,
  livemode            BOOLEAN,
  message             TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS stripe_payment_logs_created_at_idx
  ON stripe_payment_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS stripe_payment_logs_checkout_session_idx
  ON stripe_payment_logs (checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;
