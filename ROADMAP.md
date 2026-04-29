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

## SEO depth & performance polish (per-provider pages, schema breadth, CWV budgets)

**Status:** Deferred. Foundations shipped (auto title/description, robots,
sitemap, `LocalBusiness` JSON-LD with `OfferCatalog` and `AggregateRating`,
OG/Twitter tags, super-admin SEO override editor under
`/admin/tenants/[id]/website?tab=seo`). The next layer below is mostly
"more schemas + image pipeline + CI guardrails" — pick this up when we have
real organic search traffic to optimise against, or when a competitor's
search snippet visibly out-ranks ours for the same query.

**What it is**
Six related improvements that compound on the SEO foundation already in
place:

1. **Per-provider pages with unique meta.** Today only the salon root
   (`{slug}.solohub.nl/`) has bespoke SEO. If we add per-staff or
   per-service landing pages later, each needs its own `generateMetadata`
   that follows the same auto-with-override pattern but with the staff /
   service name baked in. Title pattern: `"Sara Cuts — Hair Stylist in
   Amsterdam Oud-Zuid | Book Online"`.
2. **Schema breadth.** Extend the JSON-LD blob beyond `LocalBusiness`:
   - `Person` schema per staff member, with `jobTitle`, `worksFor` →
     LocalBusiness `@id`, and `image` if we have an avatar.
   - `Service` as a top-level node (currently embedded as `Offer`s inside
     `OfferCatalog`).
   - Standalone `Offer`s linked back to the parent `Service` so price &
     availability render in rich results.
   - Validate every change with Google's Rich Results Test before
     shipping.
3. **OG / Twitter card hero image.** `generateMetadata` already emits OG
   and Twitter tags but uses the salon name only — wire `hero_image_url`
   through as `og:image` (and provide an explicit `og:image:width` /
   `:height` so social platforms don't crop weirdly). Same for Twitter.
4. **Image optimisation pass.** Replace `<img>` tags in the 5 booking
   templates and the website-content sections with `next/image`:
   - WebP/AVIF served automatically.
   - Responsive `srcset` and `sizes`.
   - `loading="lazy"` for below-fold images, `priority` for hero.
   - Explicit `width` / `height` (or `fill` + aspect-ratio container) to
     eliminate CLS on first load.

   User-uploaded images come through Supabase Storage — `next/image` works
   with remote URLs once we whitelist the host in `next.config.ts` under
   `images.remotePatterns`.
5. **Core Web Vitals budgets in CI.** Add Lighthouse CI to GitHub Actions
   running against a Vercel preview deploy. Fail the build if:
   - LCP &gt; 2.5s
   - CLS &gt; 0.1
   - INP &gt; 200ms
   on the salon landing page (we pick one representative tenant slug, e.g.
   the demo tenant). Configure via `lighthouserc.json` with explicit
   `assertions`. Block PRs on regression.
6. **Live preview in the SEO editor.** The current Website→SEO tab shows
   a static preview using the auto values (or overrides). Upgrade to a
   client component that:
   - Updates the title/description preview as the operator types.
   - Shows a character counter that goes amber at 50/140 and red at
     60/160.
   - Mirrors Google's actual SERP truncation.

**Why it's not in MVP**
We have ~zero organic traffic at MVP. Adding `Person` schema and shaving
LCP from 2.4s to 1.8s improves nothing measurable until we're actually
ranking. The foundations already shipped (auto meta, sitemap, robots,
`LocalBusiness`) cover the 80% case. Everything in this entry is the next
20% that becomes worth doing once Search Console shows real impressions
and clicks.

**Implementation sketch (when picked up)**

1. **Per-staff pages (only if we add them).** New route
   `app/(booking)/staff/[staffId]/page.tsx` with its own
   `generateMetadata`. Title generator in `lib/seo/auto-meta.ts` —
   add `autoStaffTitle(tenant, staff)` and
   `autoStaffDescription(tenant, staff, services)`. Honor optional
   per-staff override columns if we add them (`staff.seo_title`,
   `staff.meta_description`).
2. **Schema breadth.** Extend `lib/seo/json-ld.ts`:
   - Add `buildPersonJsonLd(staff, tenant)` returning an array of
     `Person` nodes (one per staff member).
   - Add `buildServiceJsonLd(services, tenant)` returning standalone
     `Service` nodes with `provider` → tenant `@id` and nested `offers`.
   - Update `app/(booking)/page.tsx` to inject all three schema blobs
     (LocalBusiness + Persons + Services) inside the same
     `dangerouslySetInnerHTML` block, or as separate `<script>` tags.
   - Run each change through https://search.google.com/test/rich-results
     before merging.
3. **OG / Twitter hero.** In `app/(booking)/page.tsx` `generateMetadata`,
   add:
   ```ts
   openGraph: { ..., images: tenant.hero_image_url
     ? [{ url: tenant.hero_image_url, width: 1200, height: 630, alt: tenant.name }]
     : [] },
   twitter: { ..., images: tenant.hero_image_url ? [tenant.hero_image_url] : [] },
   ```
   We don't actually know the user-uploaded image's dimensions; either
   normalise on upload (Supabase Edge Function that resizes to 1200×630
   for OG variants) or pick safe defaults and accept some social
   platforms cropping.
4. **Image migration.** For each of the 5 templates
   (`components/website/templates/{Luxe,Minimalist,Urban,Professional,Playful}.tsx`):
   - Replace `<img src={tenant.hero_image_url} />` with
     `<Image src={tenant.hero_image_url} alt={tenant.name} fill sizes="..." priority />`
     and wrap in an aspect-ratio container.
   - Below-fold images: drop `priority`, keep `fill` + `loading="lazy"`
     (Next does this automatically without `priority`).
   - Whitelist Supabase Storage host in `next.config.ts`:
     ```ts
     images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }] }
     ```
5. **Lighthouse CI.** Add `.github/workflows/lighthouse.yml` that:
   - Triggers on `pull_request`.
   - Waits for the Vercel preview URL via the Vercel deploy webhook (or
     uses `lhci collect --url`).
   - Runs `lhci autorun` with a `lighthouserc.json` that includes:
     ```json
     {
       "ci": {
         "assert": {
           "assertions": {
             "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
             "cumulative-layout-shift":  ["error", {"maxNumericValue": 0.1}],
             "interaction-to-next-paint": ["error", {"maxNumericValue": 200}]
           }
         }
       }
     }
     ```
   - Comments scores back on the PR via `lhci-action`.

   Pick one representative tenant URL — the demo tenant — and run
   against the salon root, the booking widget, and one detail page.
6. **Live SEO editor preview.** New client component
   `components/admin/SeoLivePreview.tsx`:
   - Takes `defaultTitle`, `defaultDescription`, `autoTitle`,
     `autoDescription` as props.
   - Renders Google-SERP-styled preview that re-renders on every
     keystroke.
   - Character counter component with thresholds (amber at 50/140, red
     at 60/160).
   - Truncates at 60/160 with `…` to match Google's SERP rendering.
   Wire into `app/(admin)/admin/tenants/[id]/website/page.tsx` Tab=seo,
   replacing the current static preview Card.

**Estimated effort:**
- Schema breadth (Person + Service standalone) + OG hero: ~half a day.
- Image migration across 5 templates with `next/image`: ~1 day, mostly
  template editing and visual QA.
- Lighthouse CI integration: ~half a day, plus tuning the budgets the
  first week as real numbers come in.
- Live SEO editor preview: ~2 hours.
- Per-provider pages: depends on whether we ship `/staff/[id]` routes at
  all — that's a separate product decision.

**Pre-work that's safe to do anytime:**
- Verify Search Console is set up for `solohub.nl` and at least one
  tenant subdomain so we can measure the impact when we ship.
- Decide whether per-staff pages are even on the roadmap — they only
  make sense for multi-staff salons and may not be worth it for the
  solo segment that's most of our user base.
- Add the Supabase Storage host to `next.config.ts` `remotePatterns` so
  `next/image` is unblocked the day we start migrating templates.

---

## How to use this file

When a customer asks for one of these, before opening a PR:
1. Re-read the entry above to refresh the design intent.
2. Confirm the implementation sketch still matches the codebase (line numbers
   drift; the file paths are the source of truth).
3. Open a tracked task and start. Update this file with `Status: shipped in
   <date>` and a link to the migration / PR when done.
