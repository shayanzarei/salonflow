import { getStripeClient } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

/** Public read of a completed Checkout Session (marketing success page). */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email:
        session.customer_details?.email ?? session.customer_email ?? null,
      plan: session.metadata?.plan ?? null,
      billing_cycle: session.metadata?.billingCycle ?? null,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not load checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
