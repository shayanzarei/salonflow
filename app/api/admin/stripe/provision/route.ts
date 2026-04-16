import { runProvisioningJob } from "@/jobs/provisioning.job";
import { insertStripePaymentLog } from "@/lib/stripe-payment-logs";
import { getStripeClient } from "@/lib/stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/stripe/provision
 *
 * Manually re-runs the provisioning job for a given Stripe checkout session.
 * Use this from the admin panel when a webhook was missed (e.g. local dev).
 *
 * Body: { sessionId: string }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { sessionId?: string };
  const sessionId = body.sessionId?.trim();
  if (!sessionId?.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    const customerEmail =
      checkoutSession.customer_details?.email ??
      checkoutSession.customer_email ??
      null;
    const customerId =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : null;
    const subscriptionId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : null;

    if (!customerId || !customerEmail) {
      return NextResponse.json(
        { error: "Session does not have a customer ID or email. Has it completed?" },
        { status: 400 }
      );
    }

    const result = await runProvisioningJob({
      stripeCustomerId: customerId,
      customerEmail,
      stripeSubscriptionId: subscriptionId,
      plan: checkoutSession.metadata?.plan ?? null,
    });

    // Also upsert a complete payment log with full session data so the
    // admin panel shows email, amount, and customer ID correctly.
    await insertStripePaymentLog({
      source: "webhook",
      event_type: "checkout.session.completed",
      stripe_event_id: `manual_resync_${sessionId}`,
      checkout_session_id: sessionId,
      customer_id: customerId,
      subscription_id: subscriptionId,
      customer_email: customerEmail,
      amount_cents: checkoutSession.amount_total,
      currency: checkoutSession.currency ?? null,
      plan: checkoutSession.metadata?.plan ?? null,
      billing_cycle: checkoutSession.metadata?.billingCycle ?? null,
      payment_status: checkoutSession.payment_status,
      livemode: checkoutSession.livemode,
      metadata: {
        mode: checkoutSession.mode,
        status: checkoutSession.status,
        resynced_by_admin: true,
      },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Provisioning failed.";
    console.error("[admin/stripe/provision]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
