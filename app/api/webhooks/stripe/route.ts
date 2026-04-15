import { NextResponse } from "next/server";
import { runProvisioningJob } from "@/jobs/provisioning.job";
import { getStripeClient } from "@/lib/stripe";
import Stripe from "stripe";

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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      if (customerId) {
        await runProvisioningJob(customerId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Stripe webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
