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

The DB layer enforces the same rule with the `bookings_no_overlap` GiST exclusion constraint (`db/migrations/public/017_bookings_exclusion_constraint.sql`). Concurrent requests that race past the application check will be rejected at COMMIT — **either** with SQLSTATE `23P01` (exclusion_violation, the constraint fired directly) **or** with SQLSTATE `40P01` (deadlock_detected, GiST page-lock contention aborted the loser before the constraint ran). Both prove the same thing: exactly one row was committed and no two overlapping rows can coexist. `isExclusionViolation()` recognises both and endpoints translate them to HTTP 409. Empirically demonstrated by `scripts/test-concurrent-bookings.ts` — under 50-way contention against the same slot we observe 1 success + 49 deadlocks (the exact 23P01-vs-40P01 split is implementation-defined and will drift with Postgres versions).

## DST behavior

Twice a year a salon-local clock skips or repeats an hour. Customers don't know or care, but `wallClockToUtc` has to pick *some* answer for ambiguous and non-existent wall-clock times, and that answer must be deterministic across deploys. The rules:

**Forward jump (spring-forward, e.g. Europe/Amsterdam 2026-03-29 02:00 → 03:00).** Wall-clock times in the skipped hour (02:00–02:59) **do not exist** on the salon's clock. The current implementation in `wallClockToUtc` silently normalises them forward by one hour: `02:30` resolves to the same UTC instant as `03:30`. This is a known sharp edge — two different wall-clock inputs map to the same UTC instant, which means a manual booking entered at `02:30` would collide with one at `03:30` on the GiST exclusion constraint. For Netherlands salons this is theoretical (no salon is open at 02:30), but the contract is: **do not rely on forward-jump wall times being distinct.** A future hardening pass should make `wallClockToUtc` throw on skipped times so the API returns a 400 with a clear message instead of silently coalescing. Acceptance test: `scripts/test-dst.ts`.

**Backward jump (fall-back, e.g. Europe/Amsterdam 2026-10-25 03:00 → 02:00).** Wall-clock times in the repeated hour (02:00–02:59) **occur twice** on the salon's clock — once in summer offset (UTC+2, before the clock goes back), once in winter offset (UTC+1, after). `wallClockToUtc` deterministically picks the **second occurrence** (the winter-offset one, after the clock has rolled back). For `Europe/Amsterdam` 2026-10-25 02:30 that's `01:30Z` (CET, UTC+1), not `00:30Z` (CEST, UTC+2). This falls out of the two-iteration convergence in `wallClockToUtc` — first pass lands in CEST, second pass re-evaluates and steps into CET. The behaviour is deterministic across the IANA zones we care about, which is what matters; the salon is closed at 02:30 anyway. Acceptance test: `scripts/test-dst.ts`.

These rules are exercised by `scripts/test-dst.ts` — run it after any tzdata bump to confirm DST seam behaviour hasn't shifted under us.

## tzdata

The runtime's IANA tzdata is what backs `Intl.DateTimeFormat`. We pin a recent version in the container image and bump it quarterly — see `db/migrations` and the deploy runbook. If a politician moves a country's DST rule in the middle of the year, an outdated tzdata silently shifts every booking. Don't ignore tzdata bumps. After every bump, re-run `scripts/test-dst.ts` to confirm forward/backward DST behaviour matches the documented contract.

## Things that look fine but aren't

- `new Date(iso).getHours()` — reads in the runtime's local zone. Use `salonLocalParts(...).hour`.
- `someDate.toDateString()` for grouping — server zone. Use `Intl.DateTimeFormat("en-CA", { timeZone: tenantZone, ... })` to produce a salon-local `YYYY-MM-DD`.
- `new Date(today).setDate(today.getDate() + 1)` to step through days — server zone. Step on a `YYYY-MM-DD` string built via `todayInZone(salonZone)`.
- `today.setHours(0,0,0,0)` to get a "day boundary" — server zone. Build with `wallClockToUtc(ymdInTenantZone, "00:00", tenantZone)`.
- Storing wall-clock as `TIMESTAMPTZ` — `2026-04-30 09:00 Europe/Amsterdam` is fine because the column normalises to UTC, but **inputs must declare which zone they came from**. Never pass an unzoned string straight to `new Date(...)` and into the DB.
