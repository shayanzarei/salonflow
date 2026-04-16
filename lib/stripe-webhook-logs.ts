import type { StripePaymentLogInsert } from "@/lib/stripe-payment-logs";
import type Stripe from "stripe";

export function stripeEventToPaymentLog(event: Stripe.Event): StripePaymentLogInsert {
  const base: StripePaymentLogInsert = {
    source: "webhook",
    event_type: event.type,
    stripe_event_id: event.id,
    livemode: event.livemode,
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      return {
        ...base,
        checkout_session_id: s.id,
        customer_id:
          typeof s.customer === "string" ? s.customer : s.customer?.id ?? null,
        subscription_id:
          typeof s.subscription === "string"
            ? s.subscription
            : s.subscription?.id ?? null,
        customer_email:
          s.customer_email ?? s.customer_details?.email ?? null,
        amount_cents: s.amount_total,
        currency: s.currency ?? null,
        plan: s.metadata?.plan ?? null,
        billing_cycle: s.metadata?.billingCycle ?? null,
        payment_status: s.payment_status,
        payment_intent_id:
          typeof s.payment_intent === "string"
            ? s.payment_intent
            : s.payment_intent?.id ?? null,
        metadata: {
          mode: s.mode,
          status: s.status,
          customer_email: s.customer_email ?? null,
          customer_details_email: s.customer_details?.email ?? null,
        },
      };
    }
    case "checkout.session.expired": {
      const s = event.data.object as Stripe.Checkout.Session;
      return {
        ...base,
        checkout_session_id: s.id,
        customer_email: s.customer_email ?? null,
        plan: s.metadata?.plan ?? null,
        billing_cycle: s.metadata?.billingCycle ?? null,
        payment_status: s.payment_status,
        metadata: {
          status: s.status,
          customer_email: s.customer_email ?? null,
          customer_details_email: s.customer_details?.email ?? null,
        },
      };
    }
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      const pi = event.data.object as Stripe.PaymentIntent;
      return {
        ...base,
        payment_intent_id: pi.id,
        customer_id:
          typeof pi.customer === "string" ? pi.customer : pi.customer?.id ?? null,
        amount_cents: pi.amount,
        currency: pi.currency,
        payment_status: pi.status,
        customer_email: pi.receipt_email ?? null,
        message: pi.last_payment_error?.message ?? null,
        metadata: {
          description: pi.description,
          cancellation_reason: pi.cancellation_reason,
        },
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      return {
        ...base,
        subscription_id: sub.id,
        customer_id:
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        payment_status: sub.status,
        metadata: {
          cancel_at_period_end: sub.cancel_at_period_end,
        },
      };
    }
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.finalized": {
      const inv = event.data.object as Stripe.Invoice;
      const invSub = (
        inv as unknown as {
          subscription?: string | Stripe.Subscription | null;
        }
      ).subscription;
      const subscriptionId =
        typeof invSub === "string" ? invSub : invSub?.id ?? null;
      return {
        ...base,
        invoice_id: inv.id,
        customer_id:
          typeof inv.customer === "string" ? inv.customer : inv.customer?.id ?? null,
        subscription_id: subscriptionId,
        amount_cents: inv.amount_paid ?? inv.amount_due,
        currency: inv.currency,
        customer_email: inv.customer_email ?? null,
        payment_status: inv.status,
        message: inv.last_finalization_error?.message ?? null,
        metadata: { billing_reason: inv.billing_reason },
      };
    }
    default:
      return {
        ...base,
        metadata: { object_id: (event.data.object as { id?: string }).id },
      };
  }
}
