CREATE TABLE IF NOT EXISTS staff_invite_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS staff_invite_tokens_staff_id_idx
  ON staff_invite_tokens (staff_id);

CREATE INDEX IF NOT EXISTS staff_invite_tokens_tenant_id_idx
  ON staff_invite_tokens (tenant_id);
