import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Slot generation tests. `computeSlots` is the brain of the booking widget —
 * a single bug here either (a) shows the customer a slot the system will
 * later reject (UX disaster, lost bookings) or (b) hides a slot that's
 * actually free (lost revenue, owner mad). Both are visible.
 *
 * The function is technically async + DB-backed, but the *math* it does
 * after the queries (slot generation, conflict bucketing, past-slot guard,
 * timezone projection) is what we want to lock down. We mock the `pool` so
 * each test can hand-script the DB responses and isolate the math.
 *
 * Test file structure:
 *   1. Mock @/lib/db so importing availability doesn't try to connect.
 *   2. Build a `mockQuery` helper that scripts one response per call.
 *   3. Each test sets a script, calls computeSlots, asserts on slots.
 */

// IMPORTANT: vi.mock is hoisted to the top of the file by the Vitest
// transformer, so the factory must NOT close over module-scope variables
// that aren't yet defined. We expose a setter on the mock instead.
const queryFn = vi.fn();
vi.mock("@/lib/db", () => ({
  default: {
    query: (...args: unknown[]) => queryFn(...args),
  },
}));

// Import AFTER the mock is registered.
import { computeSlots } from "@/lib/availability";

beforeEach(() => {
  queryFn.mockReset();
});

/**
 * Script a sequence of DB responses for one `computeSlots` invocation. The
 * function fires queries in this fixed order:
 *
 *   1. tenant timezone:   `SELECT iana_timezone FROM tenants WHERE id = $1`
 *   2. service duration:  `SELECT duration_mins FROM services ...`
 *   3. staff hours:       `SELECT start_time, end_time, is_working FROM staff_working_hours ...`
 *   3b. (maybe) any-hours fallback: `SELECT COUNT(*) FROM staff_working_hours WHERE staff_id = $1`
 *   4. salon hours:       `SELECT start_time, end_time, is_working FROM salon_working_hours ...`
 *   4b. (maybe) any-salon-hours fallback: `SELECT COUNT(*) FROM salon_working_hours WHERE tenant_id = $1`
 *   5. existing bookings: `SELECT b.booking_start_utc, b.booking_end_utc FROM bookings ...`
 *
 * The number of responses depends on the path taken (steps 3b and 4b only
 * fire when their preceding query returned no rows). Each test specifies
 * the exact sequence it expects.
 */
function scriptQueries(...rowsList: { rows: Record<string, unknown>[] }[]) {
  for (const r of rowsList) queryFn.mockResolvedValueOnce(r);
}

const STD_INPUT = {
  serviceId: "svc-1",
  staffId: "staff-1",
  tenantId: "tenant-1",
  date: "2026-06-15", // a Monday far enough in the future to avoid past-slot logic
};

describe("computeSlots — basic happy path", () => {
  it("generates back-to-back slots within working hours", async () => {
    scriptQueries(
      // 1. tenant timezone
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      // 2. service duration: 30 minutes
      { rows: [{ duration_mins: 30 }] },
      // 3. staff working hours: 10:00–12:00 on day-of-week 1 (Monday)
      {
        rows: [
          { start_time: "10:00:00", end_time: "12:00:00", is_working: true },
        ],
      },
      // 4. salon working hours: 09:00–18:00, fully covering staff
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      // 5. no existing bookings
      { rows: [] }
    );

    const slots = await computeSlots(STD_INPUT);

    // 10:00, 10:30, 11:00, 11:30 → 4 slots of 30 min in 2 hours
    expect(slots).toHaveLength(4);
    expect(slots.every((s) => s.available)).toBe(true);
    expect(slots.map((s) => s.wallClockTime)).toEqual([
      "10:00",
      "10:30",
      "11:00",
      "11:30",
    ]);
  });

  it("isoTime is UTC, wallClockTime is salon-local", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "14:00:00", end_time: "15:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );

    const slots = await computeSlots(STD_INPUT);
    expect(slots).toHaveLength(1);
    const [slot] = slots;

    // Amsterdam in June is CEST (+02:00). 14:00 local = 12:00 UTC.
    expect(slot.wallClockTime).toBe("14:00");
    expect(slot.isoTime).toBe("2026-06-15T12:00:00.000Z");
    expect(slot.isoTime.endsWith("Z")).toBe(true);
  });

  it("buckets slots into morning / afternoon / evening", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "10:00:00", end_time: "20:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "23:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );

    const slots = await computeSlots(STD_INPUT);
    expect(slots.find((s) => s.wallClockTime === "10:00")?.period).toBe(
      "morning"
    );
    expect(slots.find((s) => s.wallClockTime === "14:00")?.period).toBe(
      "afternoon"
    );
    expect(slots.find((s) => s.wallClockTime === "18:00")?.period).toBe(
      "evening"
    );
  });
});

describe("computeSlots — service / hours configuration", () => {
  it("returns [] when the service does not exist", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [] } // no service row → return early
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toEqual([]);
  });

  it("falls back to 9–18 default when staff has zero hours configured", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      { rows: [] }, // no row for this day-of-week
      { rows: [{ count: "0" }] }, // any-hours fallback: count = 0 → use default
      // No salon-hours row either — also falls back.
      { rows: [] },
      { rows: [{ count: "0" }] },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    // 9:00 → 18:00 with 60-min slots = 9 slots
    expect(slots).toHaveLength(9);
    expect(slots[0].wallClockTime).toBe("09:00");
    expect(slots[8].wallClockTime).toBe("17:00");
  });

  it("returns [] when staff has hours configured but is off today", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      { rows: [] }, // no row for this day
      { rows: [{ count: "5" }] } // staff has hours configured but not for today → []
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toEqual([]);
  });

  it("returns [] when salon has hours configured but is closed today", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "10:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      // Salon row exists for today but is_working = false.
      {
        rows: [
          { start_time: "00:00:00", end_time: "00:00:00", is_working: false },
        ],
      }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toEqual([]);
  });

  it("returns [] when salon has SOME hours configured but no row for today", async () => {
    // Tenant has set salon hours for some days but not today → today is closed,
    // not "no hours fallback". This is the documented divergence between the
    // staff fallback (default to 9-18) and the salon fallback (closed).
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      { rows: [] }, // no salon row for today
      { rows: [{ count: "5" }] } // but other salon rows exist → today is closed
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toEqual([]);
  });
});

describe("computeSlots — intersection of staff and salon hours", () => {
  it("narrows to the intersection: staff 09–18, salon 10–14 → 10–14", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "10:00:00", end_time: "14:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots.map((s) => s.wallClockTime)).toEqual([
      "10:00",
      "11:00",
      "12:00",
      "13:00",
    ]);
  });

  it("returns [] when staff and salon hours don't overlap at all", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "09:00:00", end_time: "12:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "14:00:00", end_time: "18:00:00", is_working: true },
        ],
      }
      // Note: no bookings query expected because we early-return.
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toEqual([]);
  });
});

describe("computeSlots — existing bookings mark slots booked", () => {
  it("a booking that exactly covers one slot marks just that slot booked", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "10:00:00", end_time: "13:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      // 11:00–12:00 Amsterdam (CEST) = 09:00–10:00 UTC
      {
        rows: [
          {
            booking_start_utc: "2026-06-15T09:00:00.000Z",
            booking_end_utc: "2026-06-15T10:00:00.000Z",
          },
        ],
      }
    );
    const slots = await computeSlots(STD_INPUT);

    expect(slots).toHaveLength(3);
    expect(slots[0].wallClockTime).toBe("10:00");
    expect(slots[0].available).toBe(true);
    expect(slots[1].wallClockTime).toBe("11:00");
    expect(slots[1].available).toBe(false);
    expect(slots[1].reason).toBe("booked");
    expect(slots[2].wallClockTime).toBe("12:00");
    expect(slots[2].available).toBe(true);
  });

  it("an open-interval booking does not block adjacent slots (back-to-back is OK)", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "10:00:00", end_time: "13:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      // Booking ends at 11:00 Amsterdam. The 11:00 slot starts then —
      // open-interval overlap (start < other_end AND end > other_start) is
      // false, so the 11:00 slot must be available.
      {
        rows: [
          {
            booking_start_utc: "2026-06-15T08:00:00.000Z", // 10:00 local
            booking_end_utc: "2026-06-15T09:00:00.000Z",   // 11:00 local
          },
        ],
      }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots[0].available).toBe(false); // 10:00 — overlaps the booking
    expect(slots[1].available).toBe(true); // 11:00 — touches end, doesn't overlap
    expect(slots[2].available).toBe(true);
  });

  it("filters out booking rows where UTC columns are NULL (legacy data)", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "10:00:00", end_time: "12:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { booking_start_utc: null, booking_end_utc: null }, // legacy garbage
        ],
      }
    );
    const slots = await computeSlots(STD_INPUT);
    // The garbage row should not silently sink the math — both slots free.
    expect(slots).toHaveLength(2);
    expect(slots.every((s) => s.available)).toBe(true);
  });
});

describe("computeSlots — slot durations and edges", () => {
  it("does not generate a slot that would extend past closing time", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 90 }] },
      {
        rows: [
          // 10:00–13:00 leaves room for two 90-min slots: 10:00 and 11:30.
          // A third would start at 13:00 and end at 14:30 — past closing.
          { start_time: "10:00:00", end_time: "13:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots.map((s) => s.wallClockTime)).toEqual(["10:00", "11:30"]);
  });

  it("respects 15-minute service durations", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Europe/Amsterdam" }] },
      { rows: [{ duration_mins: 15 }] },
      {
        rows: [
          { start_time: "10:00:00", end_time: "11:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toHaveLength(4);
    expect(slots.map((s) => s.wallClockTime)).toEqual([
      "10:00",
      "10:15",
      "10:30",
      "10:45",
    ]);
  });
});

describe("computeSlots — invalid/missing tenant timezone", () => {
  it("falls back to Europe/Amsterdam when iana_timezone is unset", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "" }] }, // empty
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "14:00:00", end_time: "15:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toHaveLength(1);
    // Fallback zone applied → 14:00 Amsterdam → 12:00Z in June.
    expect(slots[0].isoTime).toBe("2026-06-15T12:00:00.000Z");
  });

  it("falls back to Europe/Amsterdam when iana_timezone is invalid", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "Mars/Olympus" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "14:00:00", end_time: "15:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "18:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots).toHaveLength(1);
    expect(slots[0].isoTime).toBe("2026-06-15T12:00:00.000Z");
  });
});

describe("computeSlots — timezones other than Amsterdam", () => {
  it("America/New_York: 14:00 EDT slot in June = 18:00 UTC", async () => {
    scriptQueries(
      { rows: [{ iana_timezone: "America/New_York" }] },
      { rows: [{ duration_mins: 60 }] },
      {
        rows: [
          { start_time: "14:00:00", end_time: "15:00:00", is_working: true },
        ],
      },
      {
        rows: [
          { start_time: "09:00:00", end_time: "20:00:00", is_working: true },
        ],
      },
      { rows: [] }
    );
    const slots = await computeSlots(STD_INPUT);
    expect(slots[0].wallClockTime).toBe("14:00");
    expect(slots[0].isoTime).toBe("2026-06-15T18:00:00.000Z");
  });
});
