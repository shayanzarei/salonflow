/**
 * Booking slot algorithm — used by /api/availability and booking flow.
 *
 * All times are in LOCAL server time. Slot isoTime strings are returned as
 * "YYYY-MM-DDTHH:MM:00" (no Z / no timezone suffix), so JavaScript on both
 * server and client parses them as LOCAL time. This keeps the picker label,
 * the confirm page summary, the stored booked_at, and the email confirmation
 * all consistent.
 *
 * If a per-tenant timezone is ever added, convert here using a TZ-aware
 * library (e.g. Temporal / date-fns-tz).
 */

import pool from "@/lib/db";

export interface Slot {
  /** "YYYY-MM-DDTHH:MM:00" — no Z, local time */
  isoTime: string;
  /** "9:00 AM" */
  label: string;
  period: "morning" | "afternoon" | "evening";
  /** Whether this slot can be booked */
  available: boolean;
  /** Why it's unavailable (omitted when available) */
  reason?: "booked" | "past";
}

export async function computeSlots(input: {
  serviceId: string;
  staffId: string;
  /** YYYY-MM-DD in the caller's local calendar */
  date: string;
  tenantId: string;
}): Promise<Slot[]> {
  const { serviceId, staffId, date, tenantId } = input;

  // 1. Service duration
  const serviceRes = await pool.query(
    `SELECT duration_mins FROM services WHERE id = $1 AND tenant_id = $2`,
    [serviceId, tenantId]
  );
  if (!serviceRes.rows[0]) return [];
  const durationMins: number = parseInt(serviceRes.rows[0].duration_mins);

  // 2. Day-of-week from LOCAL date  ("2026-04-16" → local Date → .getDay())
  const localDate = new Date(date);
  const dayOfWeek = localDate.getDay(); // 0=Sun … 6=Sat

  // 3. Working hours for this staff + day
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

  // 4. Salon-level opening hours for this day (if configured)
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

  // 5. Existing bookings for this staff on this LOCAL date
  const bookingsRes = await pool.query(
    `SELECT b.booked_at, s.duration_mins AS svc_duration
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.staff_id = $1
       AND b.booked_at >= $2::timestamptz
       AND b.booked_at <  ($2::timestamptz + INTERVAL '1 day')
       AND b.status IN ('confirmed', 'pending')`,
    [staffId, `${date}T00:00:00`] // no Z → PostgreSQL uses session timezone
  );

  // Blocked ranges in minutes-from-LOCAL-midnight
  const blocked: { start: number; end: number }[] = bookingsRes.rows.map((b) => {
    const d = new Date(b.booked_at as string);
    const startMin = d.getHours() * 60 + d.getMinutes();
    return { start: startMin, end: startMin + parseInt(b.svc_duration) };
  });

  // 6. Guard against past slots for today (local comparison)
  const now = new Date();
  const todayLocal = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const isToday = date === todayLocal;
  const nowMins = isToday ? now.getHours() * 60 + now.getMinutes() : -1;

  // 7. Generate ALL slots within working hours, marking availability
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
    // Naive local-time string — no Z, parsed as local by JS
    const isoTime = `${date}T${HH}:${MM}:00`;

    const label = new Date(isoTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const period: Slot["period"] =
      h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";

    // Determine availability
    if (isToday && slotStart <= nowMins) {
      slots.push({ isoTime, label, period, available: false, reason: "past" });
      continue;
    }

    const hasConflict = blocked.some(
      (b) => slotStart < b.end && slotEnd > b.start
    );
    if (hasConflict) {
      slots.push({ isoTime, label, period, available: false, reason: "booked" });
      continue;
    }

    slots.push({ isoTime, label, period, available: true });
  }

  return slots;
}
