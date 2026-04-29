/**
 * lib/timezone.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for time-zone handling. Everything that touches a
 * timestamp must go through here.
 *
 * Rules enforced:
 *  1. Database stores UTC only (TIMESTAMPTZ).
 *  2. Booking writes carry an explicit IANA zone (e.g. 'Europe/Amsterdam').
 *  3. Wall-clock input from forms (date + time) is converted to UTC using the
 *     tenant's IANA zone — never the server's, never the browser's.
 *  4. ISO strings entering the data layer must carry a 'Z' or explicit offset.
 *     `assertIsoHasZoneOrThrow()` rejects anything else.
 *  5. Display always re-formats UTC + viewer zone with an explicit label
 *     ('14:00 CET — your local time').
 *
 * The default zone is intentionally exported so we can grep for callers that
 * still rely on a hardcoded fallback during the transition.
 */

export const DEFAULT_FALLBACK_TIMEZONE = "Europe/Amsterdam";

/* ─── Validation ─────────────────────────────────────────────────────────── */

/**
 * Returns true if `tz` is a valid IANA zone identifier the runtime accepts.
 * We probe Intl rather than relying on the (Node-only) supportedValuesOf.
 */
export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Throws if `tz` is not a valid IANA zone. Use at API boundaries so we never
 * insert an unverified zone into the database.
 */
export function assertIanaTimezone(tz: string): asserts tz is string {
  if (!isValidIanaTimezone(tz)) {
    throw new Error(
      `Invalid IANA timezone: "${tz}". Expected something like 'Europe/Amsterdam'.`
    );
  }
}

/**
 * Reject any ISO string that does not carry a 'Z' or an explicit ±HH:MM offset.
 * This is the "no naked local time" rule.
 *
 * Accepts: "2026-04-28T13:00:00Z", "2026-04-28T13:00:00+02:00"
 * Rejects: "2026-04-28T13:00:00", "2026-04-28 13:00:00", "13:00"
 */
export function isoHasExplicitZone(iso: string): boolean {
  if (typeof iso !== "string") return false;
  // Z or ±HH:MM at the end of the string.
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso.trim());
}

export function assertIsoHasZoneOrThrow(iso: string, fieldName = "timestamp"): void {
  if (!isoHasExplicitZone(iso)) {
    throw new Error(
      `${fieldName} must include a 'Z' or explicit ±HH:MM offset; received: "${iso}". ` +
        `Convert wall-clock input to UTC with wallClockToUtc() before storing.`
    );
  }
}

/* ─── Conversion: wall-clock + zone → UTC ────────────────────────────────── */

/**
 * Convert a wall-clock date/time **in the given IANA zone** to a UTC Date.
 *
 *   wallClockToUtc("2026-04-28", "14:00", "Europe/Amsterdam")
 *     → Date representing 12:00:00Z (CEST is UTC+2 on that date)
 *
 * The classic JS pitfall this avoids:
 *   `new Date("2026-04-28T14:00:00")` is parsed in the **server's** local
 *   timezone — wrong for any salon outside that zone, and silently shifted
 *   1–2 hours twice a year by DST.
 *
 * Algorithm: build a "naive UTC" date for the given wall components, ask
 * Intl what that instant looks like in the target zone, and subtract the
 * difference. One iteration is enough for IANA zones we care about; we run
 * a second pass for DST transition edges.
 */
export function wallClockToUtc(
  dateYmd: string,
  timeHm: string,
  ianaZone: string
): Date {
  assertIanaTimezone(ianaZone);

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateYmd);
  if (!dateMatch) {
    throw new Error(`Invalid date format (expected YYYY-MM-DD): "${dateYmd}"`);
  }
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeHm);
  if (!timeMatch) {
    throw new Error(`Invalid time format (expected HH:MM[:SS]): "${timeHm}"`);
  }

  const [, y, m, d] = dateMatch;
  const [, h, mi, sRaw] = timeMatch;
  const s = sRaw ?? "00";

  // Treat the wall components as if they were UTC, then correct.
  const naiveUtcMs = Date.UTC(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s)
  );

  let candidate = new Date(naiveUtcMs);
  // Two iterations cover DST seam — first pass corrects offset, second pass
  // re-evaluates after the candidate has crossed a DST boundary if it did.
  for (let i = 0; i < 2; i++) {
    const offsetMin = getOffsetMinutes(candidate, ianaZone);
    candidate = new Date(naiveUtcMs - offsetMin * 60_000);
  }
  return candidate;
}

/**
 * The offset (in minutes east of UTC) that `instant` has in `ianaZone`.
 *   Europe/Amsterdam in summer → 120
 *   Europe/Amsterdam in winter → 60
 *   America/New_York in winter → -300
 *
 * Implementation note — `hourCycle: "h23"`:
 *   en-US with `hour12: false` reports midnight as hour="24" and inconsistently
 *   pins the date to either the previous or next calendar day depending on the
 *   runtime's ICU build. That bug bit us — see the regression where
 *   `wallClockToUtc("2026-04-30", "00:00", "Europe/Amsterdam")` returned
 *   2026-04-28T22:00Z instead of 2026-04-29T22:00Z, because the second
 *   correction iteration of wallClockToUtc fed midnight back through
 *   `getOffsetMinutes` and got hour=24 with the wrong date.
 *   `hourCycle: "h23"` forces midnight to render as "00" with the correct
 *   date, eliminating the ambiguity entirely.
 */
export function getOffsetMinutes(instant: Date, ianaZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/* ─── Display ────────────────────────────────────────────────────────────── */

/**
 * Format a UTC instant for display in a specific IANA zone, with the short
 * zone abbreviation appended ("14:00 CET").
 */
export function formatInZone(
  instant: Date,
  ianaZone: string,
  opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  locale = "en-US"
): string {
  assertIanaTimezone(ianaZone);
  return new Intl.DateTimeFormat(locale, { ...opts, timeZone: ianaZone }).format(
    instant
  );
}

/**
 * Format with an explicit zone label, e.g. "14:00 CET". Used in confirmation
 * emails and any UI shown to clients in a different zone than the salon.
 */
export function formatWithZoneLabel(
  instant: Date,
  ianaZone: string,
  locale = "en-US"
): string {
  assertIanaTimezone(ianaZone);
  const time = new Intl.DateTimeFormat(locale, {
    timeZone: ianaZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);
  const zoneAbbrev =
    new Intl.DateTimeFormat(locale, {
      timeZone: ianaZone,
      timeZoneName: "short",
    })
      .formatToParts(instant)
      .find((p) => p.type === "timeZoneName")?.value ?? ianaZone;
  return `${time} ${zoneAbbrev}`;
}

/**
 * Convenience: format with both the salon's zone and the viewer's zone:
 *   "14:00 CET (08:00 EST — your local time)"
 * Pass viewerZone === salonZone to suppress the second clause.
 */
export function formatDualZone(
  instant: Date,
  salonZone: string,
  viewerZone: string,
  locale = "en-US"
): string {
  const salon = formatWithZoneLabel(instant, salonZone, locale);
  if (!viewerZone || viewerZone === salonZone) return salon;
  const viewer = formatWithZoneLabel(instant, viewerZone, locale);
  return `${salon} (${viewer} — your local time)`;
}

/* ─── Calendar / bucketing helpers ───────────────────────────────────────── */

/**
 * Decompose a UTC instant into its salon-local wall-clock parts. Use this in
 * calendar/grid components instead of calling `.getHours()`, `.getDay()`, or
 * `.getDate()` on a Date returned from the DB — those methods read in the
 * runtime's local zone, which is wrong for any salon outside the server's
 * deploy region. With this helper, bucketing logic stays in the salon's zone
 * regardless of where the code runs (Vercel, the user's browser, anywhere).
 *
 * Returned values match Date semantics where they overlap:
 *   month   1–12      (NOT 0–11 like Date#getMonth — easier to reason about)
 *   weekday 0–6       (Sunday=0 … Saturday=6, same as Date#getDay)
 *   hour    0–23
 *   minute  0–59
 */
export interface SalonLocalParts {
  year: number;
  /** 1–12 (January = 1). */
  month: number;
  /** 1–31. */
  day: number;
  /** 0=Sun … 6=Sat. */
  weekday: number;
  /** 0–23. */
  hour: number;
  /** 0–59. */
  minute: number;
}

export function salonLocalParts(instant: Date, ianaZone: string): SalonLocalParts {
  assertIanaTimezone(ianaZone);
  // `hourCycle: "h23"` is critical here. en-US with `hour12: false` renders
  // midnight as hour="24" and inconsistently pins the date to the wrong
  // calendar day depending on the ICU build. h23 forces 00–23 hours with the
  // correct date, eliminating the ambiguity. (Same fix as getOffsetMinutes —
  // see that function's comment for the regression that prompted this.)
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/* ─── Day-of-week helpers (used by availability) ─────────────────────────── */

/**
 * Day-of-week (0=Sun … 6=Sat) for a YYYY-MM-DD date interpreted in the given
 * IANA zone. Replaces the BUSINESS_TIMEZONE-bound version in lib/availability.ts.
 */
export function dayOfWeekInZone(dateYmd: string, ianaZone: string): number {
  assertIanaTimezone(ianaZone);
  const [y, m, d] = dateYmd.split("-").map(Number);
  // Midday avoids ever resolving to the day before due to negative offsets.
  const utcMidday = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekdayShort = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    weekday: "short",
  }).format(utcMidday);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekdayShort] ?? 0;
}

/**
 * "Today" as YYYY-MM-DD in the given IANA zone. Replaces the implicit
 * server-local "today" used in availability.ts.
 */
export function todayInZone(ianaZone: string): string {
  assertIanaTimezone(ianaZone);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ianaZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
