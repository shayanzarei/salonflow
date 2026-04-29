-- 017_bookings_exclusion_constraint.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Defence-in-depth against double-booking.
--
-- The application checks for overlap before INSERT/UPDATE (lib/conflict-check.ts),
-- but a concurrent pair of "is X free? yes — book X" requests can both pass
-- the check before either commits. The fix is a database-side exclusion
-- constraint: the rows physically cannot overlap, regardless of what the
-- application thinks.
--
-- The predicate must mirror lib/conflict-check.ts EXACTLY:
--   • same staff_id
--   • status ∈ {'confirmed', 'pending'}
--   • [booking_start_utc, booking_end_utc) overlaps
-- so that any change to one is followed in the other. (See AGENTS.md for the
-- contract.)
--
-- API translation: any INSERT/UPDATE that violates this raises SQLSTATE
-- 23P01 (exclusion_violation). The HTTP layer maps that to 409 Conflict —
-- see app/api/bookings/* (task #23).
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- Required for `EXCLUDE USING gist` over a UUID column. btree_gist makes
-- equality on non-range types (uuid, status text, etc.) usable inside a GiST
-- exclusion constraint alongside the range overlap operator.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ── Pre-flight: refuse to install the constraint if existing rows already
--    overlap. Migrating with overlapping data would silently fail at COMMIT
--    and leave a confused partial state. Surfacing the row pairs up front
--    gives operators a chance to clean up first.
DO $$
DECLARE
  overlap_count INTEGER;
BEGIN
  SELECT COUNT(*)
    INTO overlap_count
    FROM (
      SELECT a.id AS a_id, b.id AS b_id
      FROM bookings a
      JOIN bookings b
        ON a.staff_id = b.staff_id
       AND a.id <> b.id
       AND a.status IN ('confirmed', 'pending')
       AND b.status IN ('confirmed', 'pending')
       AND a.booking_start_utc < b.booking_end_utc
       AND a.booking_end_utc   > b.booking_start_utc
    ) AS overlap_pairs;

  IF overlap_count > 0 THEN
    RAISE EXCEPTION
      'Refusing to install exclusion constraint: % overlapping booking pairs detected. '
      'Resolve them first (cancel duplicates or split the appointments) and re-run this migration.',
      overlap_count;
  END IF;
END$$;

-- ── The constraint itself.
-- We project [booking_start_utc, booking_end_utc) into a tstzrange so the GiST
-- `&&` overlap operator can do its job. The half-open interval is intentional:
-- a booking that ends *exactly* when another starts is fine (matches the open-
-- interval rule in lib/conflict-check.ts: `start < other_end AND end > other_start`).
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(booking_start_utc, booking_end_utc, '[)') WITH &&
  )
  WHERE (status IN ('confirmed', 'pending'));

COMMIT;
