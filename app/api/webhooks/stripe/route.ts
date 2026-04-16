import { NextResponse } from "next/server";
import { runProvisioningJob } from "@/jobs/provisioning.job";
import { subscriptionConfirmationEmail } from "@/lib/emails/subscription-confirmation";
import { sendEmail } from "@/lib/emails/send";
import { getStripeClient } from "@/lib/stripe";
import { insertStripePaymentLog } from "@/lib/stripe-payment-logs";
import { stripeEventToPaymentLog } from "@/lib/stripe-webhook-logs";
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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      if (customerId && customerEmail) {
        await runProvisioningJob({
          stripeCustomerId: customerId,
          customerEmail,
          stripeSubscriptionId: subscriptionId,
          plan: session.metadata?.plan ?? null,
        });
      }

      if (insertedLog && customerEmail) {
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

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Stripe webhook error";
    console.error("[stripe webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
