<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Time-zone contract

This codebase serves multiple salons in different IANA zones. Every clock-related decision must run against the **salon's** zone, never the server's, never the staff member's browser. Below is the contract; violations cause real bugs (off-by-N hours in calendars, "available slot" → 409 on submit, missed reminders, wrong "today" counts).

## Storage

Every timestamp lives in the database as `TIMESTAMPTZ` (UTC at rest). The canonical columns on `bookings` are:

- `booking_start_utc TIMESTAMPTZ NOT NULL` — start instant in UTC.
- `booking_end_utc   TIMESTAMPTZ NOT NULL` — end instant in UTC, with `CHECK (booking_end_utc > booking_start_utc)`.
- `provider_iana_timezone TEXT NOT NULL` — denormalised IANA zone of the salon at write-time. Lets historical reads label correctly even if the salon migrates zones later.

The legacy `booked_at` column is **read-only** for application code. A trigger keeps it mirrored to `booking_start_utc` during the transition; it will be dropped in a follow-up migration. Do not write to it. Do not read from it in new code — every SELECT must use `booking_start_utc` (and `booking_end_utc` where applicable).

## Single source of truth: `lib/timezone.ts`

All conversion, validation, and formatting goes through `lib/timezone.ts`. The functions you actually call:

- `wallClockToUtc(date, time, ianaZone)` — convert salon-local `YYYY-MM-DD` + `HH:MM` to a UTC `Date`. DST-safe.
- `assertIsoHasZoneOrThrow(iso, name)` — reject naked local-time strings (no `Z`, no `±HH:MM`) at the API boundary.
- `formatInZone(instant, ianaZone, opts?)` — Intl-based formatting; **always** pass the salon's IANA zone explicitly.
- `formatWithZoneLabel(instant, ianaZone)` — adds the short zone abbreviation (`"14:00 CET"`) for display.
- `salonLocalParts(instant, ianaZone)` — decompose into `{ year, month, day, weekday, hour, minute }` in the salon's zone. **Use this instead of `.getHours()`, `.getDay()`, `.getDate()`** in any calendar/grid component — those native methods read in the runtime's zone (UTC on Vercel) and silently misalign.
- `todayInZone(ianaZone)` — salon-local `YYYY-MM-DD` for "today".
- `dayOfWeekInZone(ymd, ianaZone)` — `0=Sun…6=Sat` for a salon-local date.
- `isValidIanaTimezone(tz)` / `assertIanaTimezone(tz)` — boundary validation.

`DEFAULT_FALLBACK_TIMEZONE = "Europe/Amsterdam"` is the only hardcoded zone. Tenants whose `iana_timezone` is unset fall through to this; grep for the constant when migrating tenants off it.

## Display rules

- **Customer-facing booking widget** (`app/(booking)/`) — always renders in the salon's wall clock. The customer is booking an in-person appointment at the salon; that is the clock they need to plan around. Cross-zone visitors see the salon's time, optionally with a `formatDualZone` "(your local time)" suffix.
- **Owner dashboard** (`app/(dashboard)/`) — renders in the salon's wall clock. The owner is operating *from* the salon; their calendar is the salon's day.
- **Staff portal** (`app/(staff)/`) — renders in the salon's wall clock for the same reason. A staff member travelling abroad still sees their schedule on the salon's clock.
- **Emails** — the salon's wall clock with an explicit zone label (e.g. `"14:00 CET"`). Use `formatWithZoneLabel`.

Every `Intl.DateTimeFormat` / `.toLocaleDateString(...)` / `.toLocaleTimeString(...)` call in app code MUST pass `timeZone: tenantZone` explicitly. Without it the formatter uses the runtime's local zone — UTC on Vercel — and dashboards across the world quietly render wrong.

## Validation at the API boundary

`POST /api/bookings` and friends reject any `booked_at` / time field that doesn't carry an explicit `Z` or `±HH:MM` offset. See `assertIsoHasZoneOrThrow` and `isoHasExplicitZone` in `lib/timezone.ts`. The booking widget always serialises a UTC instant; an unzoned string here is either a stale client or a probe.

## Conflict checking

Booking overlap is computed by **`lib/conflict-check.ts`** — the single source of truth for the predicate `same staff_id ∧ status ∈ {confirmed, pending} ∧ start_utc < other.end_utc ∧ end_utc > other.start_utc`. All three create/update endpoints (`/api/bookings`, `/api/bookings/manual`, `/api/bookings/update`) call `findConflictingBooking()`. `lib/availability.ts` cannot share the helper directly (it needs rows back, not just a yes/no), but its predicate body must mirror the helper exactly — change the rule there, not here, and update the comment.

The DB layer enforces the same rule with the `bookings_no_overlap` GiST exclusion constraint (`db/migrations/public/017_bookings_exclusion_constraint.sql`). Concurrent requests that race past the application check will be rejected at COMMIT with SQLSTATE `23P01`. Endpoints translate that to HTTP 409 via `isExclusionViolation()`.

## tzdata

The runtime's IANA tzdata is what backs `Intl.DateTimeFormat`. We pin a recent version in the container image and bump it quarterly — see `db/migrations` and the deploy runbook. If a politician moves a country's DST rule in the middle of the year, an outdated tzdata silently shifts every booking. Don't ignore tzdata bumps.

## Things that look fine but aren't

- `new Date(iso).getHours()` — reads in the runtime's local zone. Use `salonLocalParts(...).hour`.
- `someDate.toDateString()` for grouping — server zone. Use `Intl.DateTimeFormat("en-CA", { timeZone: tenantZone, ... })` to produce a salon-local `YYYY-MM-DD`.
- `new Date(today).setDate(today.getDate() + 1)` to step through days — server zone. Step on a `YYYY-MM-DD` string built via `todayInZone(salonZone)`.
- `today.setHours(0,0,0,0)` to get a "day boundary" — server zone. Build with `wallClockToUtc(ymdInTenantZone, "00:00", tenantZone)`.
- Storing wall-clock as `TIMESTAMPTZ` — `2026-04-30 09:00 Europe/Amsterdam` is fine because the column normalises to UTC, but **inputs must declare which zone they came from**. Never pass an unzoned string straight to `new Date(...)` and into the DB.
