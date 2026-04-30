# SoloHub MVP — Go-Live Manual Test Plan

**Owner:** Shayan
**Date drafted:** 2026-04-30
**Target:** open self-signup, low volume
**Devices to certify:** Mobile Safari (iOS), Mobile Chrome (Android), Desktop Chrome

## How to use this checklist

Run scenarios top-to-bottom. The **P0** block must all be green before you flip the switch — these are the "if this breaks, customers cannot book and we refund money" scenarios. **P1** is "ship Monday but fix this week." **P2** is polish — file as bugs but don't block release.

Mark each row `✅ pass`, `❌ fail`, or `⚠️ partial` with a short note. Anything failing in P0 or P1 stops go-live.

For every failed scenario, note: **device, browser, timestamp, exact steps, observed vs. expected**. Without those four you can't reproduce.

---

## Pre-flight checklist (do this first, ~30 min)

These are not test scenarios — they're "is the runway clear" checks. None of them touch the UI.

- [ ] **`.env.production` audit** — confirm `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXTAUTH_SECRET`, `DATABASE_URL` are all production values, not staging. Stripe key starts with `sk_live_`, not `sk_test_`.
- [ ] **DNS** — `*.solohub.nl` wildcard resolves; SSL cert covers wildcard.
- [ ] **Stripe webhook endpoint** — `https://solohub.nl/api/webhooks/stripe` is registered in Stripe dashboard with the live signing secret.
- [ ] **Resend domain** — `solohub.nl` is verified in Resend, SPF/DKIM/DMARC pass on `mxtoolbox.com`.
- [ ] **DB migrations applied** — `019_tenant_template_copy.sql` is in production. Run `\d tenants` and confirm the seven `tpl_*` columns exist.
- [ ] **Sitemap & robots** — `https://solohub.nl/sitemap.xml` and `/robots.txt` return 200 and reasonable content.
- [ ] **Error monitoring** — Sentry / log drain is wired and you can see live events.
- [ ] **Rollback plan** — last known-good deploy SHA written down somewhere you can paste at 2am.
- [ ] **Stripe test mode toggle** — confirm Stripe dashboard is showing live data, not test, before any real payment scenario.

---

## P0 — Blockers. All must pass.

### P0-1 — Public booking happy path (Mobile Safari)

The single most important test. If this fails, do not ship.

1. Open `https://<test-tenant>.solohub.nl/` on iPhone Safari.
2. Tap **Book an Appointment**.
3. Pick a service → tap a staff member → pick tomorrow → pick a time inside opening hours.
4. Fill name, email, phone (`+31 6 12345678`).
5. Tap **Confirm**.

**Expected:**
- Lands on `/book/success?booking=<uuid>`.
- Confirmation email arrives at the address used within 60s.
- Email shows correct salon name, service, staff, date/time in salon's local zone.
- Owner sees the booking in `/dashboard` and `/calendar` within 5s of refresh.
- Booking row in DB has `status = 'pending'`, `booked_at` is a UTC timestamp matching the slot.

### P0-2 — Public booking happy path (Mobile Chrome / Android)

Repeat P0-1 on Android Chrome. Specifically watch:
- Date picker is usable (not desktop-style two-up).
- Phone input shows numeric keypad.
- The "+" prefix in the phone field doesn't get mangled.

### P0-3 — Public booking happy path (Desktop Chrome)

Repeat P0-1 on desktop. Watch for layout breaks at common widths (1280, 1440, 1920).

### P0-4 — Double-booking is rejected

This is the scenario most likely to embarrass you on day one.

1. Open the booking flow twice — Tab A and Tab B — both targeting the **same staff at the same time slot**.
2. In Tab A, click Confirm.
3. Switch to Tab B (don't refresh) and click Confirm within 2 seconds.

**Expected:**
- Tab A: success.
- Tab B: clear error message ("That time was just booked, pick another"). Tab B does **not** silently succeed.
- DB has exactly one booking for that staff/time. (Backed by `EXCLUDE USING gist` constraint, mapped to HTTP 409.)

### P0-5 — Past-date booking is rejected

Client-side guard might already hide past dates. Bypass it: open DevTools, change the form's `booked_at` hidden input to `2020-01-01T10:00:00Z`, submit.

**Expected:** 400 from `/api/bookings` ("must be in the future"). No DB row created.

### P0-6 — Booking outside opening hours is rejected

1. As super-admin, set the test tenant's salon hours to **closed Tuesday**.
2. Try to book a Tuesday slot.

**Expected:** time picker returns no slots for Tuesday. If you bypass with a forged URL → server rejects.

### P0-7 — Tenant isolation: owner A cannot touch owner B's data

The single most important *security* test.

1. Log in as owner of Tenant A.
2. Open DevTools, find any owner form (e.g. create staff at `/staff/new`).
3. Edit the hidden `tenant_id` to Tenant B's UUID, submit.

**Expected:** 403 from `/api/staff` (or whatever route). No row written under Tenant B.

Repeat with `/api/bookings/manual`, `/api/services`, `/api/settings/opening-hours`.

### P0-8 — Signup → verification → trial start

1. From a clean browser, visit `https://solohub.nl/signup`.
2. Sign up with a real inbox you control. Use minimum-length password (8 chars).
3. Verification email arrives.
4. Click the link.

**Expected:**
- Tenant row created with `tenant_status = 'pending_verification'`, `trial_ends_at = NOW() + 14 days`.
- After verify-email click → `tenant_status = 'trial'`, redirect to dashboard logged in.
- Subdomain `<slug>.solohub.nl` resolves and shows the (default) public site.

### P0-9 — Login + session persistence

1. Log out. Log back in.
2. Close browser, reopen, visit `/dashboard`.

**Expected:** session restored, no redirect to login. `getServerSession()` returns the right `tenantId`.

### P0-10 — Stripe checkout completes and upgrades plan

Use a real card on **live mode** with a low-cost plan if you have one, or use a Stripe-supplied test card on a test deploy first and then a real card on production.

1. From `/settings/billing`, click upgrade to **Hub** monthly.
2. Complete Stripe Checkout.
3. Stripe redirects back to dashboard.

**Expected:**
- Within 30s, `tenants.plan_tier = 'hub'`, `tenant_status = 'active'`, `stripe_customer_id` and `stripe_subscription_id` populated.
- Stripe webhook log shows `checkout.session.completed` and `subscription.created` were both processed without errors.

### P0-11 — Stripe webhook signature is enforced

Use Stripe CLI: `stripe trigger checkout.session.completed --add checkout_session:metadata.tenant_id=<id>` against your webhook URL **without** the right signing secret.

**Expected:** 400 from the route. No tenant_status change.

### P0-12 — Owner manual booking from dashboard

1. Owner clicks **+ New booking** in `/calendar` or `/bookings/new`.
2. Picks service, staff, date, wall-clock time, client info.
3. Submits.

**Expected:**
- Booking persists at the **correct UTC timestamp** for the salon's IANA zone (verify by reading the DB row and converting).
- Appears on the calendar in the right slot.

### P0-13 — Booking confirmation email path is resilient

Temporarily set `RESEND_API_KEY=invalid` in a staging-equivalent and create a booking.

**Expected:** booking is **still created** (DB row exists). Failure is logged but the customer gets the success page. (Don't run this on production. Just confirm in staging.)

### P0-14 — Super-admin website editor saves all tabs

For each tab — Branding, Content, **Template copy** (new), Contact, Hours, Sections, SEO — change a value, save, reload, confirm the value persisted and the public site reflects it.

**Expected per tab:**
- Branding: change template → public site renders the new template.
- Content: change tagline → public hero shows new tagline.
- Template copy: clear `tpl_hero_eyebrow` → fallback "Premium Beauty Experience" returns; type a custom value → public site shows it.
- Contact: change phone → schema.org JSON-LD on the public page reflects new phone.
- Hours: mark Sunday open 10–14 → time picker offers Sunday slots in that window only.
- Sections: toggle "Reviews" off → section disappears from public page.
- SEO: set custom title → `<title>` tag reflects it; clear it → falls back to `autoTitle()`.

### P0-15 — Public site noindex on form/checkout-style pages

View source on `/book`, `/book/staff`, `/book/time`, `/book/confirm`, `/book/success` and confirm `<meta name="robots" content="noindex">` is present.

The salon homepage at `/` should **not** be noindexed — confirm.

### P0-16 — Tenant suspension takes effect immediately

As super-admin, set a tenant's `tenant_status = 'suspended'`. Visit that tenant's subdomain anonymously and as that tenant's logged-in owner.

**Expected:** anonymous visitor sees a "this salon is unavailable" page (or 404). Logged-in owner is redirected somewhere reasonable (locked dashboard, billing, or signed out). No bookings can be created.

### P0-17 — DST-safe booking around 2026-10-25 02:00 Europe/Amsterdam

Set test tenant's `iana_timezone = 'Europe/Amsterdam'`. The clock falls back from 03:00 to 02:00 on 2026-10-25.

1. Try to book a slot at 02:30 local on 2026-10-25.

**Expected:** the slot is offered, persists at the correct UTC instant (the *first* 02:30, since wall-clock 02:30 happens twice on a fall-back day — your `wallClockToUtc()` should return a deterministic instant, not crash, not double-book). Read the row back and verify.

---

## P1 — Should pass before launch. Fix this week if not.

### P1-1 — Phone normalization round-trips

Submit each variant: `+31 6 12 34 56 78`, `0612345678`, `+1 (555) 123-4567`, `+1234`.

**Expected:** the first three normalize cleanly; the fourth (too short) → 400 error with helpful message.

### P1-2 — Resend verification email — cooldown and invalidation

1. Sign up. Don't click the link yet.
2. Hit "resend verification" three times in 30 seconds.

**Expected:** first one sends, next two are rejected (60s cooldown). Each new send invalidates the previous token (clicking the *first* email's link returns "expired" or "used").

### P1-3 — Trial expiry blocks publishing the website

Set test tenant's `trial_ends_at = NOW() - 1 day`, `tenant_status = 'trial'`. Try to publish the public site (set `website_status = 'published'`).

**Expected:** rejected with a message telling the owner to upgrade.

### P1-4 — Time-zone display consistency on owner dashboard

A booking made at 14:00 Europe/Amsterdam shows as **"14:00"** on `/calendar`, `/bookings`, the email, and the customer success page — never the underlying UTC string.

### P1-5 — Calendar week view crosses DST boundary

Navigate the owner calendar to the week containing 2026-10-25. Confirm there are no gaps, double-rendered hours, or shifted slots.

### P1-6 — Mobile booking widget at small widths (375px)

Test on iPhone SE (375px) or DevTools Responsive at 320px width:
- Buttons are tappable (≥44pt touch target).
- No horizontal scroll.
- Date/time picker fits.
- Confirm button is reachable above the keyboard when typing in the email field.

### P1-7 — Slow 3G simulation

DevTools → Network → "Slow 3G". Run the booking flow.

**Expected:**
- Loading states appear; no perpetual spinner.
- No double-submit if the user clicks "Confirm" twice during the lag.

### P1-8 — Resend booking confirmation manually from dashboard

(If this exists — if not, file as P2.) Owner opens a booking and clicks "Resend confirmation". Email arrives.

### P1-9 — Email rendering across clients

Open the confirmation email in: Gmail web, Apple Mail (Mac and iOS), Outlook web. No broken layout, no missing logos, no Render-style debug placeholders.

### P1-10 — Edit booking — own-overlap is allowed

Open an existing booking, change its time slot, save. (You're "overlapping" with yourself in the constraint sense.)

**Expected:** save succeeds. The exclusion constraint excludes the booking's own ID.

### P1-11 — Edit booking — overlap with another booking returns 409

Same as P1-10 but pick a time another booking already occupies.

**Expected:** 409 with a clear message, the original booking unchanged.

### P1-12 — Cancel booking → calendar slot freed

Cancel a booking. The slot becomes bookable again on the public site.

### P1-13 — Owner password change flow

`/settings/security` → change password → log out → log in with new password.

### P1-14 — Stripe customer portal returns and re-syncs

Owner clicks "Manage billing" → Stripe portal opens → cancels subscription → returns to dashboard.

**Expected:** within ~30s the webhook updates `tenant_status` accordingly.

### P1-15 — Sitemap reflects published tenants only

`https://solohub.nl/sitemap.xml` lists only tenants with `website_status = 'published'`. Suspended or draft tenants are absent.

### P1-16 — JSON-LD LocalBusiness validates

Run a published tenant page through `https://search.google.com/test/rich-results`. Returns valid LocalBusiness markup, no errors.

### P1-17 — Service/staff CRUD round-trips

Create service → edit → delete. Create staff → invite email arrives → edit → delete. No orphans (deleting a staff member with bookings should either block or cascade in a documented way — confirm what your model expects).

### P1-18 — Opening-hours editor: start ≥ end is rejected

Try to save Monday 17:00 → 09:00.

**Expected:** validation error, no DB write.

### P1-19 — New tenant with zero hours configured

Sign up a brand-new tenant. Don't configure hours. Try to book.

**Expected:** the system either offers a sensible default (9–18) or shows a clear "this salon hasn't set hours yet" empty state — whichever your contract says. The undocumented behavior is the bug.

### P1-20 — Super-admin "danger zone" delete requires confirmation

`/admin/tenants/<id>/danger` → click delete. Must require typing the slug or similar confirm step before destruction. After delete, the tenant's subdomain returns 404 and bookings/services/staff are gone (or soft-deleted, depending on your model).

---

## P2 — Polish. File but don't block.

### P2-1 — Empty states

Empty calendar, empty bookings list, no services, no staff — each shows a helpful empty state with a primary CTA, not a blank screen.

### P2-2 — Form error messages are human

Trigger every validation error you can find. None should expose `pg_constraint_name` or stack traces.

### P2-3 — 404 / 500 pages are branded

Visit `/this-does-not-exist`. Force a 500 by some safe means in staging. Pages match the rest of the visual system.

### P2-4 — Loading skeletons, not layout shifts

Watch the calendar and bookings list during initial render. CLS should feel calm — no jumping rows.

### P2-5 — Keyboard navigation through booking flow

Try the public booking flow with keyboard only. Tab order is sensible, Enter advances steps, Escape cancels modals.

### P2-6 — Color-contrast on brand colors

Pick a tenant with a light primary color (e.g. `#fde68a`). Buttons that use it as background must keep text readable (≥4.5:1).

### P2-7 — Logo upload size limits

Try uploading a 50MB image. Should reject before chewing up the database. PNG with alpha renders cleanly on dark and light backgrounds.

### P2-8 — Long names don't break layouts

Tenant name 80 chars, service name 80 chars, staff name 80 chars — calendar and email don't overflow.

### P2-9 — Marketing-opt-in checkbox is honored

If a signup user opts out of marketing email, no marketing email is sent (transactional still arrive — confirmation, verify-email, billing).

### P2-10 — Internationalization sanity

Slot times, dates, and currency render in a single consistent locale (Dutch or English — pick one, don't mix).

---

## Sign-off

Go-live is approved when:

- [ ] All **P0** scenarios pass on Mobile Safari, Mobile Chrome, and Desktop Chrome.
- [ ] All **P1** scenarios pass or have a written workaround agreed with you.
- [ ] **P2** issues are filed in your tracker but not blocking.
- [ ] Pre-flight checklist 100% green.
- [ ] Rollback plan is written and rehearsed once (do a fake rollback in staging — surprisingly often the runbook is wrong).

**Sign-off:**
Tested by: __________________
Date: __________________
Production deploy SHA: __________________
Last known-good rollback SHA: __________________
