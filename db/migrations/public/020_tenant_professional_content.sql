-- Bilingual content for the "Professional" website template.
--
-- Unlike the Signature template's copy overrides (migration 019, one TEXT
-- column per slot), the Professional template carries a much larger,
-- structured, *bilingual* (nl/en) content tree: hero, about, the three
-- "what makes us unique" columns, a testimonial banner, the gallery heading,
-- the newsletter block, and a multi-column footer. Modelling that as ~80
-- flat columns would be unwieldy and would need a fresh migration every time
-- the design gains a field.
--
-- Instead we store the whole tree in a single JSONB column. The canonical
-- shape and the default copy live in lib/professional-template.ts; the app
-- deep-merges stored JSON over those defaults, so:
--   - NULL          → template renders entirely from defaults
--   - partial JSON  → missing keys fall back to defaults per-field
-- This mirrors the "NULL = use the hard-coded default" contract the tpl_*
-- columns established, just at the granularity of a whole document.
--
-- Each user-facing string is itself an object { "nl": "...", "en": "..." }
-- so the public site can switch language from the salon's actual content,
-- not just UI chrome. Language-neutral data (address, phone, social links)
-- is NOT duplicated here — the template reads the existing tenants columns
-- for those, which already power the LocalBusiness JSON-LD.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS professional_content JSONB NULL;

COMMENT ON COLUMN tenants.professional_content IS
  'Bilingual (nl/en) content tree for the Professional website template. NULL = render from lib/professional-template.ts defaults. Shape + defaults defined there; app deep-merges stored JSON over defaults so partial documents fall back per-field.';
