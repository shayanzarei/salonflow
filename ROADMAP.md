# Roadmap

Post-MVP work. Tracked here so it doesn't get lost, deferred until a real customer
asks. Order is rough priority, not commitment.

---

## Per-service buffer time (`services.buffer_mins`)

**Status:** Deferred. Implement when a customer reports back-to-back bookings as
a problem (cleanup time between haircuts, room turnover between massages, etc.).

**What it is**
A per-service "tail" added after the appointment that no other booking can occupy.
A 30-minute haircut with `buffer_mins = 10` occupies a 40-minute slot from the
exclusion-constraint's perspective: customers see a 30-minute appointment, but
the next slot can't start until 40 minutes after this one.

**Why it's not in MVP**
Solo operators and single-chair salons typically prefer tight scheduling and add
their own breathing room by adjusting `duration_mins` directly. Multi-staff
salons with cleanup overhead will surface this within the first few weeks of use,
which is when we add it.

**Implementation sketch (when picked up)**

1. Migration `db/migrations/public/018_services_buffer_mins.sql`
   ```sql
   ALTER TABLE services
     ADD COLUMN buffer_mins INT NOT NULL DEFAULT 0,
     ADD CONSTRAINT services_buffer_mins_nonneg CHECK (buffer_mins >= 0);
   ```
2. Bake the buffer into `booking_end_utc` at every write site:
   - `app/api/bookings/route.ts` — line ~97
   - `app/api/bookings/manual/route.ts` — line ~82
   - `app/api/bookings/update/route.ts` — line ~120

   Change the formula from
   `new Date(start.getTime() + duration_mins * 60_000)` to
   `new Date(start.getTime() + (duration_mins + buffer_mins) * 60_000)`.
3. `lib/availability.ts` — fetch `buffer_mins` alongside `duration_mins` and use
   `slotEnd = slotStart + duration_mins + buffer_mins` for the conflict overlap
   check at lines ~243–245. Slot stepping itself stays at `duration_mins` so
   slot start times still align cleanly (every 30 min, 60 min, etc.).
4. Service forms — add a `buffer_mins` numeric input to:
   - `components/dashboard/AddServiceForm.tsx`
   - `components/dashboard/ServiceEditFormExtras.tsx` (or wherever edit lives)
   - `app/api/services/route.ts` (POST) and `app/api/services/update/route.ts`
5. Optionally surface "30 min + 10 min buffer" in the dashboard service list
   (`app/(dashboard)/services/page.tsx`).
6. **No changes needed to:**
   - The exclusion constraint (migration 017) — it operates on whatever
     `[booking_start_utc, booking_end_utc)` range we hand it.
   - `lib/conflict-check.ts` — it takes opaque UTC instants; the caller bakes
     buffer into the end value before calling.
   - `lib/timezone.ts`.

**Estimated effort:** ~1 hour, single migration, ~6 file edits.

---

## External calendar integration (Google / Apple / Outlook)

**Status:** Deferred. Implement when at least one paying customer specifically
requests it.

**What it is**
Two-way sync (or at minimum read-side sync) between the salon's booking calendar
and a staff member's personal calendar. The motivating use case: a stylist adds
a doctor's appointment to their phone's calendar at 14:00, and the salon's
booking widget should immediately stop offering 14:00 to customers.

**Why it's not in MVP**
This is a multi-week feature done correctly. Done badly, it leaks customer PII
into a third party's calendar, breaks under token-refresh edge cases, and
silently double-books when the sync window is stale. We don't want any of that
shipping in v1.

For MVP we treat the SoloHub booking calendar as the source of truth. Document
this as a known limitation in the staff onboarding email.

**Scope (when picked up)**

The "treat external calendars as untrusted inputs" rule applies: pull busy
windows on every confirmation step, never just on initial sync, because users
add personal events between login and checkout.

Concrete pieces:

1. **OAuth per provider.** Three flows (Google, Microsoft Graph for Outlook,
   Apple via CalDAV — Apple doesn't have a clean OAuth so we may park it).
   Store refresh tokens encrypted at rest. Per-staff, not per-tenant.
2. **DB schema.** New `staff_calendar_connections` table:
   `(id, staff_id, provider, external_account_email, access_token_enc,
   refresh_token_enc, token_expires_at, last_synced_at, sync_error, status,
   reconnect_required BOOLEAN NOT NULL DEFAULT false)`.

   The `reconnect_required` flag is set when refresh-token exchange fails
   (Google in particular invalidates refresh tokens after ~7 days of unused
   apps in test mode, and after password changes / revocations always). The
   UI shows a banner on the staff portal until the staff member re-runs OAuth.
3. **Busy-window cache.** New `external_busy_windows` table:
   `(id, staff_id, source_connection_id, external_event_id, start_utc, end_utc,
   etag, last_state_hash, fetched_at)`.
   TTL of ~5 minutes. Treat as advisory: include in availability bucketing AND
   re-pull at the booking confirmation step before the INSERT.
4. **Availability integration.** `lib/availability.ts` reads
   `external_busy_windows` alongside the bookings table; both contribute to
   the `blocked` set. The exclusion constraint cannot enforce this — only the
   application can — so the just-in-time re-pull at confirm-step is the only
   safety net against staleness.
5. **Conflict-check integration.** `lib/conflict-check.ts` (or a new sibling
   helper) re-fetches the staff's external busy windows synchronously inside
   the same DB transaction as the booking INSERT, and rolls back if a fresh
   external event covers the slot.
6. **Webhooks first, polling as fallback.** Polling alone leaves a 5–15 min
   window where double-bookings happen. Use:
   - **Google Calendar** push notifications via `events.watch`. Renew the
     channel before its `expiration` (max 7 days for `primary`). Verify the
     `X-Goog-Channel-Token` we set on creation.
   - **Microsoft Graph** subscriptions on `/me/events`. Renew before
     `expirationDateTime` (max 4230 minutes). Validate the `clientState`.
   - **CalDAV / Apple** has no push — fall back to a 5-min poll for those.

   On webhook receipt, fetch the changed event(s) (the webhook itself is
   advisory), update `external_busy_windows`, and bust any in-memory caches.
   Always poll-as-fallback on a 15-min cadence in case a webhook is missed
   (Google explicitly does not guarantee delivery).
7. **One-way write-back, never destructive.** If we write events to the
   personal calendar (v2 — see point 9), we follow strict rules:
   - **Only modify events SoloHub created.** Identify by writing a
     `solohub:bookingId=<uuid>` extended-property / private metadata field on
     creation. Refuse to touch any event missing that key. The first time we
     accidentally delete a customer's anniversary, trust is gone.
   - Update on reschedule. Delete only on cancel. Never bulk-clean.
   - On disconnect, leave previously-written events alone unless the staff
     member explicitly opts into "remove SoloHub events from my calendar" —
     and even then, double-confirm.
8. **Idempotency / sync_log table.** New `calendar_sync_log` table:
   `(id, connection_id, direction ('inbound'|'outbound'),
   external_event_id, booking_id, idempotency_key, last_state_hash,
   action ('created'|'updated'|'deleted'|'noop'), error_text, occurred_at)`.

   Purpose:
   - **Idempotency.** Webhooks can deliver the same change twice; reconnects
     replay history. The `idempotency_key` (= hash of provider + external
     event id + state hash) means re-processing is a no-op.
   - **Reconcile after reconnect.** When a staff member reconnects after a
     `reconnect_required` window, we replay their busy windows from
     `events.list` since `last_synced_at`. The state-hash comparison stops
     us from re-creating duplicate write-back events.
   - **Auditability.** Every "we changed this on the user's calendar" decision
     is logged with what we saw and what we did.
9. **Sync worker.** Background job that:
   - Renews webhook subscriptions before expiry (Google: 6 days, Graph: 70 hours).
   - Polls non-webhook-capable providers (CalDAV) every 5 min.
   - Polls webhook-capable providers every 15 min as a missed-event safety net.
   - Refreshes OAuth tokens proactively before `token_expires_at`. On refresh
     failure, sets `reconnect_required = true` and notifies the staff member.
10. **UI.** A "Connect calendar" page under `app/(staff)/staff-portal/settings/`
    showing connection status per provider, last-sync timestamp, a
    disconnect button, and a prominent "Reconnect required" banner when the
    flag is set. Owner dashboard shows aggregate connection status per staff
    member with a count of any reconnect-required staff.
11. **Export side (write back into the personal calendar).** Optional v2,
    behind a per-staff opt-in toggle. When a customer books with a staff
    member who has both a connected calendar AND write-back enabled, create
    a calendar event on their personal calendar with the customer's details
    and a `[SoloHub]` prefix, tagged with `solohub:bookingId=<uuid>` (see
    point 7). Update on reschedule, delete on cancel.

**Estimated effort:**
- Read-side sync (Google + Outlook) with webhooks + polling fallback +
  reconnect-required UX + sync_log: ~2 weeks.
- Write-back side with one-way safety rules: ~1 additional week.
- Apple/CalDAV is its own project and probably isn't worth it relative to
  user demand.

**Pre-work that's safe to do anytime:**
- Capture interest. Add a "would calendar sync help you?" question to the
  onboarding survey or to a future feedback form. We ship this when the data
  says we should, not before.

---

## How to use this file

When a customer asks for one of these, before opening a PR:
1. Re-read the entry above to refresh the design intent.
2. Confirm the implementation sketch still matches the codebase (line numbers
   drift; the file paths are the source of truth).
3. Open a tracked task and start. Update this file with `Status: shipped in
   <date>` and a link to the migration / PR when done.
