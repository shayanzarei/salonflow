-- Add email_verified_at to tenants so we can track when (and if) the owner
-- confirmed their email address.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Tokens table — identical pattern to password_reset_tokens.
-- Raw token is sent in the email link; only the SHA-256 hash is stored here.
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_tenant_id_idx
  ON email_verification_tokens (tenant_id);

CREATE INDEX IF NOT EXISTS email_verification_tokens_expires_at_idx
  ON email_verification_tokens (expires_at);
