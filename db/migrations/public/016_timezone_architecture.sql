-- 016_timezone_architecture.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Multi-timezone architecture (audit-driven).
-- Adds:
--   • tenants.iana_timezone        — IANA zone for the salon (e.g. 'Europe/Amsterdam')
--   • bookings.provider_iana_timezone — denormalised onto every booking
--   • bookings.booking_start_utc   — explicit UTC start
--   • bookings.booking_end_utc     — explicit UTC end (computed from service duration)
-- Backfills existing rows from the previous hardcoded constant.
--
-- All timestamps are stored as TIMESTAMPTZ (UTC at the storage layer). The new
-- *_utc columns make the contract explicit and let us drop the implicit
-- "booked_at + services.duration_mins" calculation that several callers do.
--
-- The legacy column `bookings.booked_at` is kept (mirrored to booking_start_utc
-- by trigger) so existing reads continue to work during the transition. A
-- follow-up migration can drop it once all readers are migrated.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── 1. tenants.iana_timezone ────────────────────────────────────────────────
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS iana_timezone TEXT NOT NULL DEFAULT 'Europe/Amsterdam';

-- Sanity: must be a non-empty string. Format validation lives in the app layer
-- (Intl.supportedValuesOf('timeZone')) since Postgres has no native IANA check.
ALTER TABLE tenants
  ADD CONSTRAINT tenants_iana_timezone_nonempty
  CHECK (length(iana_timezone) > 0);

-- ── 2. bookings: provider_iana_timezone, booking_start_utc, booking_end_utc ─
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS provider_iana_timezone TEXT,
  ADD COLUMN IF NOT EXISTS booking_start_utc      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS booking_end_utc        TIMESTAMPTZ;

-- Backfill existing rows from booked_at + services.duration_mins.
-- All historical rows were written assuming Europe/Amsterdam, so that becomes
-- the provider zone for any pre-migration row.
UPDATE bookings b
SET
  provider_iana_timezone = COALESCE(b.provider_iana_timezone, 'Europe/Amsterdam'),
  booking_start_utc      = COALESCE(b.booking_start_utc, b.booked_at),
  booking_end_utc        = COALESCE(
    b.booking_end_utc,
    b.booked_at + (s.duration_mins || ' minutes')::interval
  )
FROM services s
WHERE b.service_id = s.id
  AND (
    b.provider_iana_timezone IS NULL
    OR b.booking_start_utc IS NULL
    OR b.booking_end_utc   IS NULL
  );

-- Now lock them down. New rows must populate them.
ALTER TABLE bookings
  ALTER COLUMN provider_iana_timezone SET NOT NULL,
  ALTER COLUMN booking_start_utc      SET NOT NULL,
  ALTER COLUMN booking_end_utc        SET NOT NULL;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_end_after_start
  CHECK (booking_end_utc > booking_start_utc),
  ADD CONSTRAINT bookings_provider_iana_timezone_nonempty
  CHECK (length(provider_iana_timezone) > 0);

-- Index for fast availability lookups by staff + window.
CREATE INDEX IF NOT EXISTS idx_bookings_staff_start_utc
  ON bookings (staff_id, booking_start_utc)
  WHERE status IN ('pending', 'confirmed');

-- ── 3. Keep legacy booked_at in sync during transition ──────────────────────
-- Some readers still consult booked_at. Trigger keeps them aligned; new writers
-- only need to set booking_start_utc / booking_end_utc / provider_iana_timezone.
CREATE OR REPLACE FUNCTION bookings_sync_legacy_booked_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If new code wrote *_utc, mirror to booked_at.
  IF NEW.booking_start_utc IS NOT NULL THEN
    NEW.booked_at := NEW.booking_start_utc;
  -- If old code wrote booked_at only, mirror the other direction with the
  -- tenant's timezone as the provider zone fallback.
  ELSIF NEW.booked_at IS NOT NULL THEN
    NEW.booking_start_utc := NEW.booked_at;
    IF NEW.booking_end_utc IS NULL THEN
      NEW.booking_end_utc := NEW.booked_at
        + (
          SELECT (duration_mins || ' minutes')::interval
          FROM services
          WHERE id = NEW.service_id
        );
    END IF;
    IF NEW.provider_iana_timezone IS NULL OR length(NEW.provider_iana_timezone) = 0 THEN
      NEW.provider_iana_timezone := COALESCE(
        (SELECT iana_timezone FROM tenants WHERE id = NEW.tenant_id),
        'Europe/Amsterdam'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_sync_legacy_booked_at ON bookings;
CREATE TRIGGER trg_bookings_sync_legacy_booked_at
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION bookings_sync_legacy_booked_at();

-- ── 4. Defensive (re-)creation of the working-hours tables ─────────────────
-- These were referenced by code (lib/availability.ts, app/api/staff/hours/route.ts)
-- but never created by a versioned migration. Add `IF NOT EXISTS` so this is a
-- no-op where they already exist out-of-band.
CREATE TABLE IF NOT EXISTS salon_working_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_working  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, day_of_week),
  CHECK (NOT is_working OR start_time < end_time)
);

CREATE TABLE IF NOT EXISTS staff_working_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_working  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (staff_id, day_of_week),
  CHECK (NOT is_working OR start_time < end_time)
);

-- NOTE on opening hours storage:
--   start_time / end_time are TIME (wall-clock) values, intentionally NOT
--   TIMESTAMPTZ. Recurring rules ("every Monday 09:00–17:00") are tied to
--   the tenant's wall clock, not to a fixed UTC offset — otherwise DST
--   would shift opening hours twice a year. The wall-clock values are
--   resolved against tenants.iana_timezone at query time.

COMMIT;
