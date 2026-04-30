import { describe, expect, it, vi } from "vitest";
import {
  findConflictingBooking,
  isExclusionViolation,
  PG_DEADLOCK_DETECTED_SQLSTATE,
  PG_EXCLUSION_VIOLATION_SQLSTATE,
} from "@/lib/conflict-check";
import type { Pool } from "pg";

/**
 * conflict-check is the single place we decide "does this slot overlap an
 * existing booking?". A bug in the SQL parameter order or the SQLSTATE
 * mapping silently lets double-bookings through, which is the worst-case
 * customer-visible bug we have.
 *
 * We can't easily test the SQL itself without Postgres (out of scope for
 * this pass), but we *can* lock down:
 *   1. The SQLSTATE constants — fixed by the Postgres protocol.
 *   2. `isExclusionViolation` — pure function over pg's Error.
 *   3. The query-shape contract — that the right parameters in the right
 *      positions reach `db.query()`. A swap of $3/$4 here is exactly the
 *      kind of regression the manual P0-4 double-booking test would catch
 *      after the fact; this catches it pre-merge.
 *   4. The "naked timestamp" guard — the rule that protects every booking
 *      route from DST and zone-shift bugs.
 */

describe("isExclusionViolation", () => {
  it("returns true for SQLSTATE 23P01 (exclusion_violation)", () => {
    expect(isExclusionViolation({ code: PG_EXCLUSION_VIOLATION_SQLSTATE })).toBe(
      true
    );
    expect(isExclusionViolation({ code: "23P01" })).toBe(true);
  });

  it("returns true for SQLSTATE 40P01 (deadlock_detected)", () => {
    // Under contention the GiST index aborts losers as deadlocks before the
    // exclusion check fires. Functionally identical to 23P01 — both mean
    // 'someone else got the slot, return 409'.
    expect(isExclusionViolation({ code: PG_DEADLOCK_DETECTED_SQLSTATE })).toBe(
      true
    );
    expect(isExclusionViolation({ code: "40P01" })).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isExclusionViolation({ code: "23505" })).toBe(false); // unique violation
    expect(isExclusionViolation({ code: "23503" })).toBe(false); // FK violation
    expect(isExclusionViolation(new Error("boom"))).toBe(false);
  });

  it("returns false for non-error inputs", () => {
    expect(isExclusionViolation(null)).toBe(false);
    expect(isExclusionViolation(undefined)).toBe(false);
    expect(isExclusionViolation("23P01")).toBe(false); // string, not error obj
    expect(isExclusionViolation({})).toBe(false);
  });
});

describe("PG SQLSTATE constants", () => {
  it("exclusion_violation is 23P01 — fixed by Postgres", () => {
    expect(PG_EXCLUSION_VIOLATION_SQLSTATE).toBe("23P01");
  });

  it("deadlock_detected is 40P01 — fixed by Postgres", () => {
    expect(PG_DEADLOCK_DETECTED_SQLSTATE).toBe("40P01");
  });
});

describe("findConflictingBooking — query shape contract", () => {
  /**
   * Build a stub that records the (sql, params) pair `query` is invoked
   * with. Returns `{ rows: rowsToReturn }` so the function thinks the query
   * succeeded. We don't care what the SQL string says verbatim, but we do
   * lock the *parameter positions* — that's where overlap-test bugs hide.
   */
  function makeDbStub(rowsToReturn: { id: string }[] = []) {
    const calls: { sql: string; params: unknown[] }[] = [];
    const query = vi.fn(async (sql: string, params: unknown[]) => {
      calls.push({ sql, params });
      return { rows: rowsToReturn };
    });
    return { db: { query } as unknown as Pool, calls };
  }

  it("without excludeBookingId, calls query with [staffId, startUtc, endUtc]", async () => {
    const { db, calls } = makeDbStub([]);
    const result = await findConflictingBooking(db, {
      staffId: "staff-1",
      startUtc: "2026-04-30T10:00:00Z",
      endUtc: "2026-04-30T11:00:00Z",
    });

    expect(result).toBeNull();
    expect(calls).toHaveLength(1);
    expect(calls[0].params).toEqual([
      "staff-1",
      "2026-04-30T10:00:00Z",
      "2026-04-30T11:00:00Z",
    ]);
    // The open-interval test: existing.start < $3 (newEnd) AND existing.end > $2 (newStart)
    expect(calls[0].sql).toMatch(/booking_start_utc\s*<\s*\$3/);
    expect(calls[0].sql).toMatch(/booking_end_utc\s*>\s*\$2/);
  });

  it("with excludeBookingId, calls query with the id in position 2", async () => {
    const { db, calls } = makeDbStub([]);
    await findConflictingBooking(db, {
      staffId: "staff-1",
      startUtc: "2026-04-30T10:00:00Z",
      endUtc: "2026-04-30T11:00:00Z",
      excludeBookingId: "booking-42",
    });

    expect(calls[0].params).toEqual([
      "staff-1",
      "booking-42",
      "2026-04-30T10:00:00Z",
      "2026-04-30T11:00:00Z",
    ]);
    expect(calls[0].sql).toMatch(/<>\s*\$2/);
  });

  it("returns the conflicting booking id when one exists", async () => {
    const { db } = makeDbStub([{ id: "existing-booking-7" }]);
    const result = await findConflictingBooking(db, {
      staffId: "staff-1",
      startUtc: "2026-04-30T10:00:00Z",
      endUtc: "2026-04-30T11:00:00Z",
    });
    expect(result).toBe("existing-booking-7");
  });

  it("rejects naked-local-time startUtc (no Z, no offset)", async () => {
    const { db } = makeDbStub([]);
    await expect(
      findConflictingBooking(db, {
        staffId: "staff-1",
        startUtc: "2026-04-30T10:00:00", // no zone — bug
        endUtc: "2026-04-30T11:00:00Z",
      })
    ).rejects.toThrow(/startUtc/);
  });

  it("rejects naked-local-time endUtc", async () => {
    const { db } = makeDbStub([]);
    await expect(
      findConflictingBooking(db, {
        staffId: "staff-1",
        startUtc: "2026-04-30T10:00:00Z",
        endUtc: "2026-04-30T11:00:00", // no zone — bug
      })
    ).rejects.toThrow(/endUtc/);
  });

  it("filters by status IN (confirmed, pending) — cancelled rows must not block", async () => {
    const { db, calls } = makeDbStub([]);
    await findConflictingBooking(db, {
      staffId: "staff-1",
      startUtc: "2026-04-30T10:00:00Z",
      endUtc: "2026-04-30T11:00:00Z",
    });
    expect(calls[0].sql).toMatch(/status\s+IN\s*\(\s*'confirmed'\s*,\s*'pending'\s*\)/);
  });
});
