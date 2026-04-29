/**
 * lib/conflict-check.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single-source-of-truth for the booking-overlap predicate.
 *
 * Three call sites used to inline this query (POST /api/bookings, POST
 * /api/bookings/manual, POST /api/bookings/update) and a fourth read it for
 * availability (lib/availability.ts). Keeping them aligned by hand is how we
 * end up with "availability says 13:00 free, create returns 409" bugs — one
 * site gets tweaked, the others lag.
 *
 * The contract here intentionally narrow:
 *   • UTC instants only — never wall-clock.
 *   • Status set: 'confirmed' | 'pending'. Cancelled/no-show rows do not block.
 *   • Open-interval overlap: new_start < existing_end AND new_end > existing_start.
 *     This means a booking that ends *exactly* when another starts is fine.
 *   • Optional `excludeBookingId` is for the update path — a row must not
 *     conflict with itself.
 *
 * The matching exclusion constraint at the DB layer (see migration #022,
 * pending) uses the same predicate so even a race between two HTTP requests
 * cannot create overlapping rows.
 */
import type { Pool, PoolClient } from "pg";
import { assertIsoHasZoneOrThrow } from "./timezone";

export interface ConflictCheckInput {
  staffId: string;
  /** UTC ISO 8601 instant (Z or ±HH:MM). Validated. */
  startUtc: string;
  /** UTC ISO 8601 instant (Z or ±HH:MM). Validated. */
  endUtc: string;
  /** Booking id to exclude (used by the update endpoint). */
  excludeBookingId?: string | null;
}

/**
 * Postgres SQLSTATE for `EXCLUDE` constraint violation. Raised by the
 * `bookings_no_overlap` exclusion constraint when two requests race past the
 * application-level check and both try to write overlapping rows.
 */
export const PG_EXCLUSION_VIOLATION_SQLSTATE = "23P01";

/**
 * Postgres SQLSTATE for deadlock. Under high contention against the *same*
 * range, GiST page-lock acquisition order isn't deterministic and Postgres
 * aborts losing transactions as deadlocks before the exclusion check fires.
 * The winning transaction commits exactly one row, so the "no double-booking"
 * invariant holds — but losers see 40P01 instead of 23P01. From the caller's
 * perspective both mean "you don't get this slot, please try again", and we
 * map them to the same 409 response. See scripts/test-concurrent-bookings.ts
 * which demonstrates this empirically with 50-way contention.
 */
export const PG_DEADLOCK_DETECTED_SQLSTATE = "40P01";

/**
 * Type guard for a Postgres error coming back from `pg`. The driver throws
 * an Error subclass that carries `code` (SQLSTATE) and other PG-specific
 * fields. We only need `code` for the 409 mapping.
 *
 * Returns true for both:
 *   • 23P01 exclusion_violation — the constraint rejected the row directly
 *   • 40P01 deadlock_detected   — page-lock contention on the GiST index
 *                                 aborted the loser before the constraint
 *                                 even ran. Functionally identical to the
 *                                 caller: someone else got the slot.
 */
export function isExclusionViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  return (
    code === PG_EXCLUSION_VIOLATION_SQLSTATE ||
    code === PG_DEADLOCK_DETECTED_SQLSTATE
  );
}

/**
 * Returns the id of a conflicting booking, or `null` if the slot is free.
 * Throws if either ISO string lacks an explicit zone — that's a programmer
 * error, not a runtime condition we want to soft-handle.
 */
export async function findConflictingBooking(
  db: Pool | PoolClient,
  input: ConflictCheckInput
): Promise<string | null> {
  const { staffId, startUtc, endUtc, excludeBookingId } = input;

  // Hard-fail on naked local-time strings — see lib/timezone.ts for the rule.
  assertIsoHasZoneOrThrow(startUtc, "startUtc");
  assertIsoHasZoneOrThrow(endUtc, "endUtc");

  if (excludeBookingId) {
    const res = await db.query(
      `SELECT b.id
         FROM bookings b
         WHERE b.staff_id           = $1
           AND b.id                 <> $2
           AND b.status             IN ('confirmed', 'pending')
           AND b.booking_start_utc  < $4::timestamptz
           AND b.booking_end_utc    > $3::timestamptz
         LIMIT 1`,
      [staffId, excludeBookingId, startUtc, endUtc]
    );
    return res.rows[0]?.id ?? null;
  }

  const res = await db.query(
    `SELECT b.id
       FROM bookings b
       WHERE b.staff_id           = $1
         AND b.status             IN ('confirmed', 'pending')
         AND b.booking_start_utc  < $3::timestamptz
         AND b.booking_end_utc    > $2::timestamptz
       LIMIT 1`,
    [staffId, startUtc, endUtc]
  );
  return res.rows[0]?.id ?? null;
}
