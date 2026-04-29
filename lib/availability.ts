import pool from "@/lib/db";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  dayOfWeekInZone,
  getOffsetMinutes,
  isValidIanaTimezone,
  todayInZone,
  wallClockToUtc,
} from "@/lib/timezone";

/**
 * lib/availability.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Slot generation for the booking widget.
 *
 * Time-zone contract:
 *   • Working-hours rows store wall-clock TIME values; their meaning is "this
 *     hour on the salon's clock", interpreted against `tenants.iana_timezone`.
 *   • The output `Slot.isoTime` is a **UTC** ISO string (Z-suffixed) so that
 *     POST /api/bookings can compare it against `booking_start_utc` directly
 *     and pass `assertIsoHasZoneOrThrow`.
 *   • The display `label` is rendered in the salon's zone — that's the wall
 *     clock the customer expects to see ("3:00 PM" at the salon's time).
 */

export interface Slot {
  /** UTC ISO 8601 instant the slot starts at (ends with 'Z'). */
  isoTime: string;
  /**
   * Salon-local 24h wall-clock time (e.g. "14:00") for this slot.
   *
   * This is the value the dashboard "Add Booking" form should POST as `time`
   * to `/api/bookings/manual` — that endpoint runs `wallClockToUtc(date, time,
   * tenantZone)` on the way in. Slicing `isoTime` for the time part is a bug:
   * it would yield the UTC hour, not the salon-local hour, so a 14:00 CEST
   * slot would arrive at the server as 12:00.
   */
  wallClockTime: string;
  /** Human label rendered in the salon's wall clock, e.g. "3:00 PM". */
  label: string;
  period: "morning" | "afternoon" | "evening";
  /** Whether this slot can be booked. */
  available: boolean;
  /** Why it's unavailable (omitted when available). */
  reason?: "booked" | "past";
}

export async function computeSlots(input: {
  serviceId: string;
  staffId: string;
  /** YYYY-MM-DD in the salon's local calendar. */
  date: string;
  tenantId: string;
}): Promise<Slot[]> {
  const { serviceId, staffId, date, tenantId } = input;

  // ── 0. Resolve the salon's IANA zone. Everything below is anchored on it.
  //      Falling back to DEFAULT_FALLBACK_TIMEZONE preserves the historic
  //      behaviour for any tenant whose iana_timezone is somehow unset.
  const tenantRes = await pool.query(
    `SELECT iana_timezone FROM tenants WHERE id = $1`,
    [tenantId]
  );
  const rawZone = (tenantRes.rows[0]?.iana_timezone ?? "") as string;
  const salonZone =
    rawZone && isValidIanaTimezone(rawZone) ? rawZone : DEFAULT_FALLBACK_TIMEZONE;

  // ── 1. Service duration
  const serviceRes = await pool.query(
    `SELECT duration_mins FROM services WHERE id = $1 AND tenant_id = $2`,
    [serviceId, tenantId]
  );
  if (!serviceRes.rows[0]) return [];
  const durationMins: number = parseInt(serviceRes.rows[0].duration_mins);

  // ── 2. Day-of-week interpreted in the salon's zone, NOT the server's.
  const dayOfWeek = dayOfWeekInZone(date, salonZone); // 0=Sun … 6=Sat

  // ── 3. Working hours for this staff + day
  const hoursRes = await pool.query(
    `SELECT start_time, end_time, is_working
     FROM staff_working_hours
     WHERE staff_id = $1 AND day_of_week = $2`,
    [staffId, dayOfWeek]
  );

  let startTotal: number;
  let endTotal: number;

  if (!hoursRes.rows[0] || !hoursRes.rows[0].is_working) {
    const anyRes = await pool.query(
      `SELECT COUNT(*) FROM staff_working_hours WHERE staff_id = $1`,
      [staffId]
    );
    if (parseInt(anyRes.rows[0].count) === 0) {
      // No hours configured yet → fall back to 9 AM – 6 PM
      startTotal = 9 * 60;
      endTotal = 18 * 60;
    } else {
      return []; // hours configured but today is a day off
    }
  } else {
    const { start_time, end_time } = hoursRes.rows[0] as {
      start_time: string;
      end_time: string;
    };
    const [sh, sm] = start_time.split(":").map(Number);
    const [eh, em] = end_time.split(":").map(Number);
    startTotal = sh * 60 + sm;
    endTotal = eh * 60 + em;
  }

  // ── 4. Salon-level opening hours for this day (if configured)
  const salonHoursRes = await pool.query(
    `SELECT start_time, end_time, is_working
     FROM salon_working_hours
     WHERE tenant_id = $1 AND day_of_week = $2`,
    [tenantId, dayOfWeek]
  );

  if (!salonHoursRes.rows[0]) {
    const anySalonHoursRes = await pool.query(
      `SELECT COUNT(*) FROM salon_working_hours WHERE tenant_id = $1`,
      [tenantId]
    );
    const hasAnySalonHours = parseInt(anySalonHoursRes.rows[0].count) > 0;
    if (hasAnySalonHours) {
      return [];
    }
  } else if (!salonHoursRes.rows[0].is_working) {
    return [];
  } else {
    const { start_time, end_time } = salonHoursRes.rows[0] as {
      start_time: string;
      end_time: string;
    };
    const [sh, sm] = start_time.split(":").map(Number);
    const [eh, em] = end_time.split(":").map(Number);
    const salonStart = sh * 60 + sm;
    const salonEnd = eh * 60 + em;

    startTotal = Math.max(startTotal, salonStart);
    endTotal = Math.min(endTotal, salonEnd);
    if (startTotal >= endTotal) {
      return [];
    }
  }

  // ── 5. Existing bookings for this staff on the selected salon-local date.
  //      Compute the day's UTC bounds explicitly via wallClockToUtc so we don't
  //      depend on Postgres's session timezone or the legacy `booked_at`.
  const dayStartUtc = wallClockToUtc(date, "00:00", salonZone);
  const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60_000);

  // Use an interval-overlap predicate against the day window so we catch
  // bookings that *start* before the day but *end* inside it (e.g. an
  // appointment that began the previous local night and extends past local
  // midnight). Filtering only by `booking_start_utc` between dayStartUtc and
  // dayEndUtc would miss those rows, while POST /api/bookings/manual's own
  // conflict check (which is unbounded and uses overlap) would still reject
  // the slot — producing the divergence where availability says "free" and
  // create says "already booked".
  //
  // The predicate body (status set + open-interval overlap on
  // booking_start_utc / booking_end_utc) MUST stay in lock-step with
  // lib/conflict-check.ts. We can't share the helper here because we need
  // multiple rows back (to bucket per slot) rather than a single existence
  // check, but the rule is the same.
  const bookingsRes = await pool.query(
    `SELECT b.booking_start_utc, b.booking_end_utc
     FROM bookings b
     WHERE b.staff_id = $1
       AND b.status IN ('confirmed', 'pending')
       AND b.booking_start_utc < $3::timestamptz
       AND b.booking_end_utc   > $2::timestamptz`,
    [staffId, dayStartUtc.toISOString(), dayEndUtc.toISOString()]
  );

  // Convert each booking's UTC instants back into salon-local minutes-from-
  // midnight so the overlap check is in the same coordinate system as
  // startTotal/endTotal above. The .filter guards against rows where the UTC
  // columns are somehow NULL (legacy seed data, manual psql inserts that
  // bypassed the trigger) — those would produce Invalid Date and silently
  // sink the bucketing math.
  const blocked: { start: number; end: number }[] = bookingsRes.rows
    .filter((b) => b.booking_start_utc && b.booking_end_utc)
    .map((b) => {
      const startUtc = new Date(b.booking_start_utc as string);
      const endUtc = new Date(b.booking_end_utc as string);
      const startLocalMin = utcToSalonMinutes(startUtc, salonZone, dayStartUtc);
      const endLocalMin = utcToSalonMinutes(endUtc, salonZone, dayStartUtc);
      return { start: startLocalMin, end: endLocalMin };
    });

  // ── 6. Guard against past slots for today, evaluated in the salon's zone.
  const todayLocal = todayInZone(salonZone);
  const isToday = date === todayLocal;
  let nowMins = -1;
  if (isToday) {
    const now = new Date();
    nowMins = utcToSalonMinutes(now, salonZone, dayStartUtc);
  }

  // ── 7. Generate slots within working hours.
  const slots: Slot[] = [];

  for (
    let slotStart = startTotal;
    slotStart + durationMins <= endTotal;
    slotStart += durationMins
  ) {
    const slotEnd = slotStart + durationMins;

    const h = Math.floor(slotStart / 60);
    const m = slotStart % 60;

    const HH = String(h).padStart(2, "0");
    const MM = String(m).padStart(2, "0");
    const wallClockTime = `${HH}:${MM}`;

    // Convert salon wall-clock → UTC. The resulting ISO is Z-suffixed, which
    // is exactly what the booking widget should POST back: it survives the
    // boundary check in app/api/bookings/route.ts (isoHasExplicitZone).
    const startUtc = wallClockToUtc(date, wallClockTime, salonZone);
    const isoTime = startUtc.toISOString();

    // Display label uses the salon's wall clock — that's what the customer
    // booking from anywhere expects to see for an in-person appointment.
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: salonZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(startUtc);

    const period: Slot["period"] =
      h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";

    if (isToday && slotStart <= nowMins) {
      slots.push({ isoTime, wallClockTime, label, period, available: false, reason: "past" });
      continue;
    }

    const hasConflict = blocked.some(
      (b) => slotStart < b.end && slotEnd > b.start
    );
    if (hasConflict) {
      slots.push({ isoTime, wallClockTime, label, period, available: false, reason: "booked" });
      continue;
    }

    slots.push({ isoTime, wallClockTime, label, period, available: true });
  }

  return slots;
}

/**
 * Project a UTC instant onto "minutes from local midnight" in `salonZone`,
 * relative to the salon-local day that begins at `dayStartUtc`.
 *
 * If the instant lies before that day → returns a negative number.
 * If it lies after → returns >= 1440.
 *
 * Implementation note: we ask Intl what the instant looks like in the salon's
 * zone, then subtract from the day start. Doing the subtraction in UTC
 * milliseconds avoids any DST cliff on the day itself.
 */
function utcToSalonMinutes(
  instant: Date,
  salonZone: string,
  dayStartUtc: Date
): number {
  // Offset (in minutes) of `instant` in the salon zone — used to compute the
  // wall-clock minutes-of-day the instant maps to. We re-apply the offset to
  // the day start as well so the difference is taken on the same axis.
  const offsetAtInstant = getOffsetMinutes(instant, salonZone);
  const offsetAtDayStart = getOffsetMinutes(dayStartUtc, salonZone);
  // Wall-clock instant = UTC + offset
  const wallInstantMin = (instant.getTime() + offsetAtInstant * 60_000) / 60_000;
  const wallDayStartMin =
    (dayStartUtc.getTime() + offsetAtDayStart * 60_000) / 60_000;
  return Math.round(wallInstantMin - wallDayStartMin);
}
