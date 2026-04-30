# Stripe end-to-end test runbook

**Owner:** Shayan
**Date drafted:** 2026-04-30
**Scope:** subscription checkout, customer portal, webhooks, admin provisioning
**Stripe SDK:** `stripe@22` (Node)

This runbook walks the same flow three times — local sandbox, staging, then a real production charge — so you find bugs in cheap environments before they cost real money. Mark each row `pass / fail / partial`. Anything failing in Phase 1 or 2 stops you from running Phase 3.

The expected behaviour below was derived from your actual code:

- `app/api/stripe/checkout/route.ts` — creates Checkout Session, stamps `metadata.plan` + `metadata.billingCycle`, carries trial.
- `app/api/stripe/checkout/session/route.ts` — success-page lookup that **also** runs provisioning as a webhook fallback.
- `app/api/stripe/portal/route.ts` — creates Billing Portal session.
- `app/api/webhooks/stripe/route.ts` — verifies signature, handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- `jobs/provisioning.job.ts` — links Stripe customer to existing tenant by `owner_email`, or creates new tenant + sends setup email.

---

## Phase 0 — Pre-flight (do once, ~10 min)

Don't touch the UI yet. Verify the runway is clear.

- [ ] **`.env.local` has every Stripe var the code reads.** Required:
  - `STRIPE_SECRET_KEY` (must start `sk_test_` for Phase 1)
  - `STRIPE_WEBHOOK_SECRET` (the value Stripe CLI prints when you run `stripe listen`, starts `whsec_`)
  - `STRIPE_PRICE_SOLO_MONTHLY`, `STRIPE_PRICE_SOLO_ANNUAL`
  - `STRIPE_PRICE_HUB_MONTHLY`, `STRIPE_PRICE_HUB_ANNUAL`
  - `STRIPE_PRICE_AGENCY_MONTHLY`, `STRIPE_PRICE_AGENCY_ANNUAL`
  - `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)
- [ ] **Stripe CLI logged in** to the right account: `stripe config --list` shows your test-mode account ID.
- [ ] **Test prices exist in test mode.** In the Stripe dashboard switch to **Test mode** and confirm each `price_…` ID above resolves to a recurring price in EUR (or your currency).
- [ ] **DB is reachable and migrated.** `psql "$DATABASE_URL" -c "\d tenants"` shows `stripe_customer_id`, `stripe_subscription_id`, `plan_tier`, `tenant_status`. `\d stripe_payment_logs` exists (migration `010`).
- [ ] **Two terminals open**: one for `npm run dev`, one for `stripe listen`.

---

## Phase 1 — Local sandbox (Stripe test mode)

No real money. This is where you find ~80% of the bugs. Don't skip a single check.

### 1.1 Boot the stack

Terminal A:
```bash
cd /Users/shayanzarei/Desktop/salonflow
npm run dev
```

Terminal B (forwards real Stripe events to localhost; **the webhook signing secret it prints must match `STRIPE_WEBHOOK_SECRET` in `.env.local`** — copy/paste it the first time):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Leave both running. If you change `.env.local`, restart `npm run dev`.

- [ ] `stripe listen` prints `Ready! Your webhook signing secret is whsec_…` and that value matches `.env.local`.
- [ ] Hitting `http://localhost:3000` returns 200.

### 1.2 Checkout — happy path (Solo monthly)

1. Open `http://localhost:3000/pricing`.
2. Pick **Solo / Monthly** → click upgrade.
3. In Stripe Checkout, use card `4242 4242 4242 4242`, any future expiry, any CVC, any postal.
4. Submit.

**Expected:**

- [ ] Browser lands on `/pricing/checkout/success?session_id=cs_test_…`.
- [ ] Within ~3s the success page populates plan, billing cycle, amount, and email — that data comes from `GET /api/stripe/checkout/session`, which reads back the session from Stripe.
- [ ] Terminal A shows no 5xx errors.
- [ ] Terminal B shows `checkout.session.completed → 200 OK` and `customer.subscription.created → 200 OK` (and possibly `invoice.paid`, `payment_intent.succeeded`).
- [ ] DB check:
  ```sql
  SELECT id, owner_email, plan_tier, tenant_status,
         stripe_customer_id, stripe_subscription_id, trial_ends_at
  FROM tenants
  WHERE owner_email = '<the email you used>';
  ```
  Row exists with `plan_tier='solo'`, `tenant_status='active'`, `stripe_customer_id` starts `cus_`, `stripe_subscription_id` starts `sub_`.
- [ ] Audit log:
  ```sql
  SELECT event_type, source, payment_status, livemode, plan, billing_cycle
  FROM stripe_payment_logs
  WHERE checkout_session_id = '<the cs_… from the URL>'
  ORDER BY created_at;
  ```
  You see at minimum `checkout.session.created` (source=`api`) and `checkout.session.completed` (source=`webhook` or `api` — both paths log it).
- [ ] **Setup email** arrives at the address you used. It contains a `/reset-password?token=…` link. Click it; you can set a password and log in. (`runProvisioningJob` enqueued this via Resend.)

### 1.3 Checkout — webhook-fallback path

This proves the success page can provision on its own when the webhook is delayed (the code does this on purpose for local dev resilience).

1. **Stop** `stripe listen` in Terminal B.
2. Run a fresh checkout with a *different* email — pick **Hub / Annual** this time, card `4242 4242 4242 4242`.
3. Watch the success page.

**Expected:**

- [ ] Success page still shows "provisioned" (the route calls `runProvisioningJob` directly when the webhook hasn't fired).
- [ ] DB has the tenant row with `plan_tier='hub'`.
- [ ] `stripe_payment_logs` shows an entry with `stripe_event_id = 'success_page_cs_…'` (this is the success-page provenance marker).
- [ ] Restart `stripe listen` and confirm subsequent runs go back to webhook-driven provisioning.

### 1.4 Checkout — promo code

1. Create a 100%-off promo code in the test dashboard (Products → Coupons → Promotion codes).
2. Run checkout. Apply the code in the Stripe-hosted page.
3. Pay €0.

**Expected:**

- [ ] Stripe accepts the code (the route sets `allow_promotion_codes: true`).
- [ ] Success page shows €0 / `payment_status: no_payment_required`.
- [ ] Provisioning still runs (the success-page route accepts both `paid` and `no_payment_required`).

### 1.5 Checkout — declined card

1. Run checkout with the declined-card test number `4000 0000 0000 0002`.

**Expected:**

- [ ] Stripe shows the decline message in-page.
- [ ] You eventually cancel → land on `/pricing/checkout/cancel`.
- [ ] **No tenant row** is created in DB for that email.
- [ ] `stripe_payment_logs` has a `checkout.session.created` entry but no `checkout.session.completed`.

### 1.6 Checkout — 3DS / authentication required

1. Run checkout with `4000 0025 0000 3155` (requires 3DS).
2. Complete the modal challenge.

**Expected:**

- [ ] Provisioning runs only after the challenge completes (`checkout.session.completed` fires).
- [ ] DB shows tenant active with the right plan.

### 1.7 Webhook signature is enforced

This protects against forged events. Don't skip — your prod endpoint must reject unsigned requests.

```bash
curl -i -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -d '{"id":"evt_fake","type":"checkout.session.completed","data":{"object":{}}}'
```

- [ ] HTTP status is **400** (route rejects when `stripe-signature` header missing).
- [ ] No DB rows touched.

Now try with a bogus signature header:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H 'stripe-signature: t=1,v1=deadbeef' \
  -d '{"id":"evt_fake","type":"checkout.session.completed","data":{"object":{}}}'
```

- [ ] HTTP status is **400** (`constructEvent` throws).

### 1.8 Customer portal — open

1. Log in as the tenant owner you provisioned in 1.2.
2. Visit `/settings/billing` → click "Manage billing" (or whatever button hits `POST /api/stripe/portal`).

**Expected:**

- [ ] Browser is redirected to a `https://billing.stripe.com/p/session/…` URL.
- [ ] You see your Stripe customer's invoices, current plan, and payment method.
- [ ] Click **Return to SoloHub** → land back on `/settings/billing` (the `return_url` the route sets).

### 1.9 Customer portal — upgrade Solo → Hub

1. From inside the portal click **Update plan** → pick Hub monthly → confirm.
2. Watch Terminal B for `customer.subscription.updated`.

**Expected:**

- [ ] Webhook returns 200.
- [ ] DB:
  ```sql
  SELECT plan_tier, tenant_status, stripe_subscription_id
  FROM tenants WHERE owner_email='<that email>';
  ```
  `plan_tier='hub'`, `tenant_status='active'`. `stripe_subscription_id` matches the one in the webhook payload.
- [ ] The route's plan resolution prefers `metadata.plan` and falls back to a price-ID reverse map. Watch for the console log `[stripe webhook] subscription.updated → customer cus_… { plan: 'hub', subscriptionStatus: 'active', tenantStatus: 'active' }`.

### 1.10 Customer portal — cancel subscription (immediate)

1. Cancel **immediately** (not at period end).

**Expected:**

- [ ] Terminal B shows `customer.subscription.deleted → 200 OK`.
- [ ] DB: `tenant_status='suspended'`, `stripe_subscription_id IS NULL`.

If the portal is configured to cancel **at period end**, you'll see `customer.subscription.updated` with `cancel_at_period_end=true` and status still `active` — that case keeps the tenant active until period end. To force-test the deletion path use `stripe trigger customer.subscription.deleted`.

### 1.11 Customer portal — past_due grace window

The webhook intentionally **does not** flip `tenant_status` when subscription becomes `past_due` — that's a deliberate grace period (see the comment in the route).

1. ```bash
   stripe trigger customer.subscription.updated --add subscription:status=past_due
   ```
2. **Expected:** webhook returns 200, console shows `subscriptionStatus: 'past_due'`, but `tenant_status` in DB **does not change** to `suspended`. This is correct.

### 1.12 Admin manual provision (webhook miss recovery)

This is your "oops, the webhook never fired in prod" recovery lever.

1. Sign in as a super-admin (a tenant with `is_admin=true`).
2. Find a `cs_test_…` ID from Stripe dashboard for a paid session whose tenant didn't auto-provision.
3. ```bash
   curl -i -X POST http://localhost:3000/api/admin/stripe/provision \
     -H 'content-type: application/json' \
     -H "cookie: $YOUR_AUTH_COOKIE" \
     -d '{"sessionId":"cs_test_…"}'
   ```

**Expected:**

- [ ] Non-admin gets 403.
- [ ] Admin gets 200 with `{ ok: true, created: true|false, tenantId }`.
- [ ] `stripe_payment_logs` has an entry with `stripe_event_id = 'manual_resync_cs_…'`.
- [ ] Tenant row matches what provisioning produces.

### 1.13 Idempotency

Provisioning runs in three places (webhook, success page, admin re-sync). Re-running must not duplicate tenants.

1. For the same `cs_test_…` from 1.2, hit the success-page endpoint twice and the admin endpoint once:
   ```bash
   curl "http://localhost:3000/api/stripe/checkout/session?session_id=cs_test_…"
   curl "http://localhost:3000/api/stripe/checkout/session?session_id=cs_test_…"
   ```
2. **Expected:** still exactly one row in `tenants` for that email; `stripe_payment_logs` has multiple rows (each with a distinct `stripe_event_id`/idempotency marker — that's fine, the audit log is supposed to record every call).

### 1.14 Trial-end propagation

If you signed up with a `trialEndsAt` in the body, the route forwards it as `subscription_data.trial_end`.

1. ```bash
   curl -X POST http://localhost:3000/api/stripe/checkout \
     -H 'content-type: application/json' \
     -d "{\"plan\":\"solo\",\"billingCycle\":\"monthly\",\"email\":\"trial-test@example.com\",\"trialEndsAt\":\"$(date -u -v +7d +%Y-%m-%dT%H:%M:%SZ)\"}"
   ```
2. Open the returned URL, complete checkout.
3. **Expected:** in Stripe dashboard the subscription is in **Trial** state until 7 days from now; first invoice is dated then.

### 1.15 Phase 1 sign-off

- [ ] All 1.x checkboxes green.
- [ ] No 5xx in the dev server log.
- [ ] No webhook returned non-2xx other than the deliberately-tested 400s.

If anything failed, fix and re-run before touching staging.

---

## Phase 2 — Staging (deployed, still Stripe test mode)

Same flow, real network, real database, still no real money. This catches env-var drift, webhook URL mistakes, and CORS/cookie/redirect-URL issues that don't surface locally.

### 2.1 Pre-flight

- [ ] Staging deploy is running on its own URL (e.g. `https://staging.solohub.nl`).
- [ ] `STRIPE_SECRET_KEY` on staging starts `sk_test_` (NOT `sk_live_` — easy mistake).
- [ ] `NEXT_PUBLIC_APP_URL` on staging matches the staging URL exactly (no trailing slash).
- [ ] All six `STRIPE_PRICE_*` env vars are set on staging.
- [ ] In **Stripe dashboard → Developers → Webhooks (test mode)**, an endpoint exists pointing to `https://staging.solohub.nl/api/webhooks/stripe`. Subscribe at least: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
- [ ] Copy the **Signing secret** for that endpoint into staging's `STRIPE_WEBHOOK_SECRET`.

### 2.2 Re-run the critical Phase 1 scenarios on staging

For each, confirm DB state on the staging database (not local).

- [ ] 1.2 happy path (Solo monthly).
- [ ] 1.5 declined card.
- [ ] 1.7 webhook signature enforcement (`curl` against the staging URL — must 400).
- [ ] 1.8 portal opens.
- [ ] 1.9 portal upgrade.
- [ ] 1.10 portal cancel.

### 2.3 Webhook delivery from real Stripe

This is the whole point of staging. Verify the dashboard's **Webhooks → your endpoint → Recent events** view shows each event delivered with status `200 OK` and recent attempts. If any event shows retries or 4xx, click in and read the response body — it tells you exactly what your route returned.

- [ ] No event with status >= 400 in the last hour.
- [ ] Latency per event is reasonable (under a few seconds).

### 2.4 Phase 2 sign-off

- [ ] All 2.x rows green.
- [ ] You've confirmed staging tenants exist in staging DB and don't bleed into prod.

---

## Phase 3 — Production (real card, small real charge)

This is the live-money pass. Don't run it until Phases 1 and 2 are 100% green. Pick the cheapest plan you have so a refund is trivial.

### 3.1 Pre-flight

- [ ] Production deploy is the SHA you intend to ship — write it down for rollback.
- [ ] `STRIPE_SECRET_KEY` on prod starts `sk_live_`.
- [ ] All six `STRIPE_PRICE_*` env vars on prod point to **live-mode** prices (different IDs from test mode — this is the most common bug).
- [ ] In **Stripe dashboard → Developers → Webhooks (live mode)** there is an endpoint at `https://solohub.nl/api/webhooks/stripe` with the same event subscriptions as staging.
- [ ] `STRIPE_WEBHOOK_SECRET` on prod is the **live-mode** signing secret (starts `whsec_…` but is a different value from test mode and from staging).
- [ ] In Stripe dashboard the toggle is on **Live data**.
- [ ] You have a real card you control and a way to refund it.
- [ ] You have a fresh email inbox you control to receive the setup email.

### 3.2 Live happy path (Solo monthly)

1. From a clean browser session at `https://solohub.nl/pricing`, pick **Solo / Monthly**.
2. Use a real card. Pay.
3. Confirm Stripe redirects to `https://solohub.nl/pricing/checkout/success?session_id=cs_…`.

**Expected:**

- [ ] Success page populates plan, billing cycle, amount, currency, customer_email.
- [ ] **Stripe dashboard (Live mode)**: Customers → new customer; Payments → succeeded charge; Subscriptions → active subscription with the Solo monthly price.
- [ ] **Webhooks (Live mode) → recent events**: `checkout.session.completed → 200`, `customer.subscription.created → 200`, `invoice.paid → 200`. No retries.
- [ ] **Production DB**:
  ```sql
  SELECT id, plan_tier, tenant_status, stripe_customer_id, stripe_subscription_id
  FROM tenants WHERE owner_email = '<your real email>';
  ```
  Row is `plan_tier='solo'`, `tenant_status='active'`, both Stripe IDs set.
- [ ] **stripe_payment_logs** has rows with `livemode = true`. (Spot-check this — `livemode=false` in prod means a misconfigured key.)
- [ ] Setup email arrived at your real inbox; the `reset-password` link works on `https://solohub.nl`.

### 3.3 Live portal — manage and downgrade test

1. As the new owner, open `/settings/billing` → Manage billing → portal opens.
2. Update payment method to a different real card (or skip).
3. Cancel subscription **at period end**.

**Expected:**

- [ ] Portal opens at `https://billing.stripe.com/p/session/…`.
- [ ] On returning to `/settings/billing`, the page reflects the change within ~30s (after `customer.subscription.updated` arrives).
- [ ] DB still shows the tenant active until the period ends; you'll get the deletion event later.

### 3.4 Refund the test charge

1. Stripe dashboard → the test charge → **Refund**.
2. Confirm `charge.refunded` arrives at the webhook (currently your route returns 200 without DB side-effects — that's fine; just confirm no errors).
3. Email yourself a note about the refund for accounting.

### 3.5 Production sign-off

- [ ] 3.x rows green.
- [ ] Refund issued and visible in Stripe.
- [ ] No errors in production logs (Sentry / log drain) tied to `/api/webhooks/stripe` or `/api/stripe/*` during the test window.
- [ ] You wrote down: production deploy SHA, last known-good rollback SHA, the test-charge `cs_…` ID, and the refund ID.

---

## Things to watch for (your specific code, not generic Stripe advice)

These are real edge cases in your code, not theoretical ones — fix or document them before scaling traffic:

1. **Two provisioning paths can race.** `app/api/stripe/checkout/session/route.ts` (success page) and `app/api/webhooks/stripe/route.ts` both call `runProvisioningJob` for the same `cs_…`. The provisioning job is idempotent on `owner_email` (UPDATE-on-existing path), so this is safe — but verify it under load by running the success-page GET and the webhook within a few hundred ms of each other and confirming exactly one tenant row.

2. **`STRIPE_PRICE_*` live IDs vs test IDs.** The webhook route uses these env vars to reverse-map a price → plan tier when `metadata.plan` is missing on `customer.subscription.updated`. If prod is misconfigured with test-mode price IDs, post-checkout upgrades via the portal will silently fail to update `plan_tier` (the route's `if (plan)` guard skips the SET). Sanity-check by triggering one portal upgrade in prod after launch.

3. **`tenant_status` flip on `subscription.updated`.** The route maps `active`/`trialing → 'active'` and `canceled`/`unpaid → 'suspended'`, but does not map `incomplete` or `incomplete_expired`. A failed-on-first-invoice subscription will leave the tenant in whatever state provisioning set. Either add those statuses to the map, or accept and document the gap.

4. **`subscription.deleted` clears `stripe_subscription_id`.** If a customer re-subscribes later via a fresh Checkout, the new subscription ID will be written by the next `subscription.updated`. Confirm this round-trip works in Phase 2 (cancel → re-subscribe with the same `customer_email`).

5. **Webhook handler does not currently react to `invoice.payment_failed`.** It logs the event but doesn't notify the owner or change tenant state. That's a correctness call you may want to revisit before you have customers in production whose cards expire.

6. **Provisioning trial overrides.** `runProvisioningJob` always writes `trial_ends_at = NOW() + INTERVAL '14 days'` for new tenants, even if the customer just paid. That's probably fine because `tenant_status='active'` overrides "trial" in your authorization logic, but worth confirming the dashboard doesn't show a stale "trial ends in 14 days" banner.

---

## Reference: Stripe test cards

| Scenario | Number |
|---|---|
| Success | `4242 4242 4242 4242` |
| Decline (generic) | `4000 0000 0000 0002` |
| Decline (insufficient funds) | `4000 0000 0000 9995` |
| 3DS required | `4000 0025 0000 3155` |
| Disputed (fraudulent) | `4000 0000 0000 0259` |

Any future expiry, any 3-digit CVC, any postal.

## Reference: Useful Stripe CLI triggers

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

These hit your local endpoint with realistic payloads; useful for exercising the webhook code paths without going through Checkout.
