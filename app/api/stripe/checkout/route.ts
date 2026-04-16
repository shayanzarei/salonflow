import { getStripeClient } from "@/lib/stripe";
import { insertStripePaymentLog } from "@/lib/stripe-payment-logs";
import { NextRequest, NextResponse } from "next/server";

type PlanId = "solo" | "hub" | "agency";
type BillingCycle = "monthly" | "annual";

const PRICE_ENV_MAP: Record<PlanId, Record<BillingCycle, string | undefined>> = {
  solo: {
    monthly: process.env.STRIPE_PRICE_SOLO_MONTHLY,
    annual: process.env.STRIPE_PRICE_SOLO_ANNUAL,
  },
  hub: {
    monthly: process.env.STRIPE_PRICE_HUB_MONTHLY,
    annual: process.env.STRIPE_PRICE_HUB_ANNUAL,
  },
  agency: {
    monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL,
  },
};

const VALID_PLANS = new Set<PlanId>(["solo", "hub", "agency"]);
const VALID_CYCLES = new Set<BillingCycle>(["monthly", "annual"]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      plan?: string;
      billingCycle?: string;
      email?: string;
    };

    const plan = (body.plan ?? "").toLowerCase() as PlanId;
    const billingCycle = (body.billingCycle ?? "").toLowerCase() as BillingCycle;
    const email = body.email?.trim().toLowerCase();

    if (!VALID_PLANS.has(plan) || !VALID_CYCLES.has(billingCycle)) {
      return NextResponse.json({ error: "Invalid plan selection." }, { status: 400 });
    }

    const priceId = PRICE_ENV_MAP[plan][billingCycle];
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price not configured for ${plan} (${billingCycle}).` },
        { status: 500 }
      );
    }

    const stripe = getStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || request.nextUrl.origin;
    const baseUrl = appUrl.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing/checkout/cancel`,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      metadata: {
        plan,
        billingCycle,
      },
    });

    await insertStripePaymentLog({
      source: "api",
      event_type: "checkout.session.created",
      checkout_session_id: session.id,
      customer_email: email ?? null,
      plan,
      billing_cycle: billingCycle,
      payment_status: session.payment_status,
      livemode: session.livemode,
      metadata: { price_id: priceId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
