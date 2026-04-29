/**
 * /api/debug/availability — temporary diagnostic endpoint.
 *
 * Surfaces the exact rows the availability query and the conflict-check query
 * see for a given (staff, date), so we can pin down why availability says a
 * slot is free while POST /api/bookings/manual returns 409.
 *
 * Gated on NODE_ENV !== "production" — the response includes raw booking rows
 * (client identifiers omitted) and would otherwise leak per-tenant data.
 *
 * Usage:
 *   GET /api/debug/availability?staffId=<uuid>&date=2026-04-30&time=13:00
 *
 * The `time` is optional; when supplied, the endpoint runs a conflict-check
 * for the slot at `time` (assuming a 60-minute service if no service id) and
 * shows whether the predicate would match.
 */
import pool from "@/lib/db";
import { findConflictingBooking } from "@/lib/conflict-check";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
  wallClockToUtc,
} from "@/lib/timezone";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled in production" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date");
  const time = searchParams.get("time"); // optional: HH:MM
  const durationParam = searchParams.get("durationMins");

  if (!staffId || !date) {
    return NextResponse.json(
      { error: "staffId and date are required" },
      { status: 400 }
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  // Pull the staff row → tenant → tenant zone, mirroring the path availability
  // takes. No auth here on purpose: this endpoint is dev-only.
  const staffRes = await pool.query(
    `SELECT s.id, s.tenant_id, t.iana_timezone
     FROM staff s
     JOIN tenants t ON t.id = s.tenant_id
     WHERE s.id = $1`,
    [staffId]
  );
  const staffRow = staffRes.rows[0];
  if (!staffRow) {
    return NextResponse.json({ error: "staff not found" }, { status: 404 });
  }
  const rawZone = (staffRow.iana_timezone ?? "") as string;
  const salonZone =
    rawZone && isValidIanaTimezone(rawZone) ? rawZone : DEFAULT_FALLBACK_TIMEZONE;

  const dayStartUtc = wallClockToUtc(date, "00:00", salonZone);
  const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60_000);

  // 1. The availability predicate — exactly what lib/availability.ts runs.
  const availabilityRes = await pool.query(
    `SELECT id, status, booking_start_utc, booking_end_utc, booked_at, service_id
     FROM bookings
     WHERE staff_id = $1
       AND status IN ('confirmed', 'pending')
       AND booking_start_utc < $3::timestamptz
       AND booking_end_utc   > $2::timestamptz
     ORDER BY booking_start_utc`,
    [staffId, dayStartUtc.toISOString(), dayEndUtc.toISOString()]
  );

  // 2. ALL active rows for this staff (no time filter) — to surface rows the
  //    predicate misses (NULL UTC columns, status mismatch, etc.).
  const allActiveRes = await pool.query(
    `SELECT id, status, booking_start_utc, booking_end_utc, booked_at, service_id
     FROM bookings
     WHERE staff_id = $1
       AND status IN ('confirmed', 'pending')
     ORDER BY booking_start_utc NULLS FIRST
     LIMIT 100`,
    [staffId]
  );

  // 3. Optional: simulate the conflict-check path the POST endpoints use.
  let conflictCheck: unknown = null;
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    const durationMins = Number(durationParam ?? "60");
    const startUtc = wallClockToUtc(date, time, salonZone);
    const endUtc = new Date(startUtc.getTime() + durationMins * 60_000);
    const conflictId = await findConflictingBooking(pool, {
      staffId,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
    });
    conflictCheck = {
      input: {
        date,
        time,
        durationMins,
        startUtc: startUtc.toISOString(),
        endUtc: endUtc.toISOString(),
      },
      conflictId,
    };
  }

  return NextResponse.json(
    {
      input: { staffId, date, time, salonZone },
      window: {
        dayStartUtc: dayStartUtc.toISOString(),
        dayEndUtc: dayEndUtc.toISOString(),
      },
      availabilityPredicateMatches: availabilityRes.rows,
      allActiveRowsForStaff: allActiveRes.rows,
      conflictCheck,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
