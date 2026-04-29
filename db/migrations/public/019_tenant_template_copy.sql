-- Editable copy slots for the public-site templates. Each is an optional
-- override; NULL means "fall back to the template's hard-coded default".
-- This pattern matches the existing `seo_title` / `meta_description` columns
-- (migration 018) so super-admin can tune copy per-tenant without forcing
-- every operator to think about marketing copy on day one.
--
-- Field map (Signature template, scoped to its sections):
--   tpl_hero_eyebrow         — small label above the H1 ("Premium Beauty Experience")
--   tpl_hero_description     — paragraph under the H1
--   tpl_services_title       — "Signature Services" header on the services band
--   tpl_services_description — sub-header under tpl_services_title
--   tpl_cta_title            — "Ready for your transformation?" banner H2
--   tpl_cta_description      — paragraph under the CTA banner H2
--   tpl_footer_about         — short paragraph in the footer brand column
--
-- The `tpl_` prefix keeps these fields visually grouped in `\d tenants` and
-- in autocomplete, distinct from the editorial columns (tagline, about, etc.)
-- which power multiple templates simultaneously.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS tpl_hero_eyebrow         TEXT NULL,
  ADD COLUMN IF NOT EXISTS tpl_hero_description     TEXT NULL,
  ADD COLUMN IF NOT EXISTS tpl_services_title       TEXT NULL,
  ADD COLUMN IF NOT EXISTS tpl_services_description TEXT NULL,
  ADD COLUMN IF NOT EXISTS tpl_cta_title            TEXT NULL,
  ADD COLUMN IF NOT EXISTS tpl_cta_description      TEXT NULL,
  ADD COLUMN IF NOT EXISTS tpl_footer_about         TEXT NULL;

COMMENT ON COLUMN tenants.tpl_hero_eyebrow IS
  'Optional override for the small label above the hero H1. NULL = template default.';
COMMENT ON COLUMN tenants.tpl_hero_description IS
  'Optional override for the paragraph under the hero H1. NULL = template default.';
COMMENT ON COLUMN tenants.tpl_services_title IS
  'Optional override for the services-band H2. NULL = template default.';
COMMENT ON COLUMN tenants.tpl_services_description IS
  'Optional override for the services-band sub-header. NULL = template default.';
COMMENT ON COLUMN tenants.tpl_cta_title IS
  'Optional override for the booking CTA banner H2. NULL = template default.';
COMMENT ON COLUMN tenants.tpl_cta_description IS
  'Optional override for the booking CTA banner paragraph. NULL = template default.';
COMMENT ON COLUMN tenants.tpl_footer_about IS
  'Optional override for the short brand paragraph in the footer. NULL = template default.';
