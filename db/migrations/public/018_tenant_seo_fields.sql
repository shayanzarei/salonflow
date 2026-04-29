-- 018_tenant_seo_fields.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- SEO override fields on `tenants`.
--
-- The public booking page auto-generates a sensible `<title>` and `<meta
-- name="description">` from tenant.name + first services + city. That covers
-- 95% of tenants who'll never touch SEO copy. These two columns let
-- super-admins (or, later, owners) override the auto-generated value for the
-- handful of tenants where the auto copy doesn't capture what's worth ranking
-- for ("Best blowouts in Jordaan", etc.).
--
-- Both columns are NULLable — that's the signal "use the auto-generated
-- value". An empty string would muddle that, so the API layer normalises ''
-- to NULL on write (NULLIF($1, '')).
--
-- Length caps are advisory: Google truncates titles around 60 chars and
-- descriptions around 160. We don't enforce them at the DB layer because
-- (a) Postgres TEXT has no penalty for being long and (b) marketers
-- occasionally test longer copy to see what happens.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS seo_title       TEXT NULL,
  ADD COLUMN IF NOT EXISTS meta_description TEXT NULL;

COMMENT ON COLUMN tenants.seo_title IS
  'Optional override for the public booking page <title>. NULL = use the auto-generated title from lib/seo/auto-meta.ts.';
COMMENT ON COLUMN tenants.meta_description IS
  'Optional override for the public booking page meta description. NULL = use the auto-generated description from lib/seo/auto-meta.ts.';

COMMIT;
