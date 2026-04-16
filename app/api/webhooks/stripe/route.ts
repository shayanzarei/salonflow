import { NextResponse } from "next/server";
import { runProvisioningJob } from "@/jobs/provisioning.job";
import { subscriptionConfirmationEmail } from "@/lib/emails/subscription-confirmation";
import { sendEmail } from "@/lib/emails/send";
import { getStripeClient } from "@/lib/stripe";
import { insertStripePaymentLog } from "@/lib/stripe-payment-logs";
import { stripeEventToPaymentLog } from "@/lib/stripe-webhook-logs";
import pool from "@/lib/db";
import Stripe from "stripe";

const LOGGED_TYPES = new Set<string>([
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.finalized",
]);

function shouldLogStripeEventSummary(type: string): boolean {
  return (
    type.startsWith("payment_intent.") || type.startsWith("checkout.session.")
  );
}

type PlanTier = "solo" | "hub" | "agency";

/**
 * Resolve plan tier from a subscription object.
 * Prefers metadata stamped at checkout; falls back to price ID reverse-lookup.
 */
function resolvePlanFromSubscription(sub: Stripe.Subscription): PlanTier | null {
  const metaPlan = sub.metadata?.plan;
  if (metaPlan === "solo" || metaPlan === "hub" || metaPlan === "agency") {
    return metaPlan;
  }

  const priceId = sub.items.data[0]?.price?.id;
  if (!priceId) return null;

  const priceMap: Record<string, PlanTier> = {};
  const pairs: [string | undefined, PlanTier][] = [
    [process.env.STRIPE_PRICE_SOLO_MONTHLY, "solo"],
    [process.env.STRIPE_PRICE_SOLO_ANNUAL, "solo"],
    [process.env.STRIPE_PRICE_HUB_MONTHLY, "hub"],
    [process.env.STRIPE_PRICE_HUB_ANNUAL, "hub"],
    [process.env.STRIPE_PRICE_AGENCY_MONTHLY, "agency"],
    [process.env.STRIPE_PRICE_AGENCY_ANNUAL, "agency"],
  ];
  for (const [envId, plan] of pairs) {
    if (envId) priceMap[envId] = plan;
  }
  return priceMap[priceId] ?? null;
}

/** subscription.created → provision tenant (see lib/provisioner). */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET is not set" },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const stripe = getStripeClient();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    let insertedLog = false;
    if (LOGGED_TYPES.has(event.type)) {
      insertedLog = await insertStripePaymentLog(stripeEventToPaymentLog(event));
    } else if (shouldLogStripeEventSummary(event.type)) {
      insertedLog = await insertStripePaymentLog({
        source: "webhook",
        event_type: event.type,
        stripe_event_id: event.id,
        livemode: event.livemode,
        metadata: {
          object_id: (event.data.object as { id?: string }).id,
        },
      });
    }

    // ─── New subscription checkout completed ────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      if (customerId && customerEmail) {
        const provisionResult = await runProvisioningJob({
          stripeCustomerId: customerId,
          customerEmail,
          stripeSubscriptionId: subscriptionId,
          plan: session.metadata?.plan ?? null,
        });

        // Send confirmation email only for newly created accounts (webhook path).
        // Existing accounts were already emailed from the checkout success page.
        if (provisionResult.ok && provisionResult.created && customerEmail) {
          const { subject, html } = subscriptionConfirmationEmail({
            email: customerEmail,
            plan: session.metadata?.plan ?? null,
            billingCycle: session.metadata?.billingCycle ?? null,
            amountCents: session.amount_total,
            currency: session.currency,
          });
          await sendEmail({
            to: customerEmail,
            subject,
            html,
            from: "SoloHub <hello@solohub.nl>",
          });
        }
      }
    }

    // ─── Upgrade / downgrade via Customer Portal ────────────────────────────
    // Fires whenever a subscription's plan, status, or trial period changes.
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : null;
      if (customerId) {
        const plan = resolvePlanFromSubscription(sub);
        const subscriptionStatus = sub.status; // active | trialing | past_due | canceled | …

        // Map Stripe subscription status to our tenant_status.
        // - active / trialing  → active (paid or in trial grace)
        // - past_due           → keep current status (give a grace window)
        // - canceled / other   → suspended
        let tenantStatus: string | null = null;
        if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
          tenantStatus = "active";
        } else if (subscriptionStatus === "canceled" || subscriptionStatus === "unpaid") {
          tenantStatus = "suspended";
        }
        // past_due: intentionally leave unchanged (give payment retry time)

        // Build the UPDATE dynamically so we never overwrite plan_tier with null.
        const queryParams: unknown[] = [sub.id, customerId];
        const setClauses: string[] = ["stripe_subscription_id = $1"];
        if (plan) {
          queryParams.push(plan);
          setClauses.push(`plan_tier = $${queryParams.length}`);
        }
        if (tenantStatus) {
          queryParams.push(tenantStatus);
          setClauses.push(`tenant_status = $${queryParams.length}`);
        }
        await pool.query(
          `UPDATE tenants SET ${setClauses.join(", ")} WHERE stripe_customer_id = $2`,
          queryParams
        );

        console.log(
          `[stripe webhook] subscription.updated → customer ${customerId}`,
          { plan, subscriptionStatus, tenantStatus }
        );
      }
    }

    // ─── Subscription cancelled (from portal or via API) ───────────────────
    // Fires when the subscription is fully deleted, not just set to cancel_at_period_end.
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : null;
      if (customerId) {
        await pool.query(
          `UPDATE tenants
           SET tenant_status = 'suspended',
               stripe_subscription_id = NULL
           WHERE stripe_customer_id = $1`,
          [customerId]
        );
        console.log(
          `[stripe webhook] subscription.deleted → customer ${customerId} suspended`
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Stripe webhook error";
    console.error("[stripe webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
