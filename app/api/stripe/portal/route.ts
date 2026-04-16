import { getStripeClient } from "@/lib/stripe";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session for the current tenant so they can
 * manage their subscription (upgrade, downgrade, cancel, update payment method)
 * without us building that UI.
 *
 * Returns { url } — the caller should redirect to it.
 */
export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    if (!tenant.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || request.nextUrl.origin;
    const returnUrl = `${appUrl.replace(/\/$/, "")}/settings/billing`;

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create portal session.";
    console.error("[stripe portal]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
