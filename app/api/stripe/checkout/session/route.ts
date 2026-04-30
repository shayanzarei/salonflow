import { runProvisioningJob } from "@/jobs/provisioning.job";
import { subscriptionConfirmationEmail } from "@/lib/emails/subscription-confirmation";
import { sendEmail } from "@/lib/emails/send";
import { insertStripePaymentLog } from "@/lib/stripe-payment-logs";
import { getStripeClient } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

/** Public read of a completed Checkout Session (marketing success page).
 *
 * Also acts as a provisioning fallback: if the session is complete and paid
 * but the webhook hasn't fired yet (e.g. local dev without stripe listen),
 * this triggers provisioning so the user's plan updates immediately.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    // Expand total_details.breakdown so we can show subtotal / VAT / total
    // separately on the success page and the confirmation email. Without the
    // expansion Stripe returns total_details with the aggregate amounts but
    // not the per-tax-rate breakdown.
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["total_details.breakdown"],
    });

    // Pull the tax/subtotal/total trio. amount_subtotal is the pre-tax sum of
    // line items; total_details.amount_tax is the VAT (or 0 for reverse-charge
    // / non-EU); amount_total is what the customer actually paid.
    const amountSubtotal = session.amount_subtotal;
    const amountTax = session.total_details?.amount_tax ?? 0;
    const amountTotal = session.amount_total;

    const isPaid =
      session.status === "complete" &&
      (session.payment_status === "paid" ||
        session.payment_status === "no_payment_required");

    let provisioned = false;
    let provisioningError: string | null = null;

    if (isPaid) {
      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (customerId && customerEmail) {
        try {
          const result = await runProvisioningJob({
            stripeCustomerId: customerId,
            customerEmail,
            stripeSubscriptionId: subscriptionId,
            plan: session.metadata?.plan ?? null,
          });
          provisioned = true;

          // Insert a complete payment log so admin panel and billing history
          // both show the correct email, amount, and status.
          // Uses the session ID as idempotency key — safe to run multiple times.
          await insertStripePaymentLog({
            source: "api",
            event_type: "checkout.session.completed",
            stripe_event_id: `success_page_${sessionId}`,
            checkout_session_id: sessionId,
            customer_id: customerId,
            subscription_id: subscriptionId,
            customer_email: customerEmail,
            amount_cents: session.amount_total,
            currency: session.currency ?? null,
            plan: session.metadata?.plan ?? null,
            billing_cycle: session.metadata?.billingCycle ?? null,
            payment_status: session.payment_status,
            livemode: session.livemode,
            metadata: {
              mode: session.mode,
              status: session.status,
              source: "checkout_success_page",
            },
          });

          // Send confirmation email only when this run actually created the
          // tenant — otherwise the parallel webhook path will (or already did)
          // send its own copy and the customer gets a duplicate.
          // Mirrors the guard in app/api/webhooks/stripe/route.ts.
          if (result.ok && result.created) {
            const { subject, html } = subscriptionConfirmationEmail({
              email: customerEmail,
              plan: session.metadata?.plan ?? null,
              billingCycle: session.metadata?.billingCycle ?? null,
              subtotalCents: amountSubtotal,
              taxCents: amountTax,
              amountCents: amountTotal,
              currency: session.currency,
            });
            await sendEmail({
              to: customerEmail,
              subject,
              html,
              from: "SoloHub <hello@solohub.nl>",
            });
          }
        } catch (err) {
          provisioningError =
            err instanceof Error ? err.message : "Provisioning failed";
          console.error("[checkout/session] provisioning error", err);
        }
      }
    }

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email:
        session.customer_details?.email ?? session.customer_email ?? null,
      plan: session.metadata?.plan ?? null,
      billing_cycle: session.metadata?.billingCycle ?? null,
      // Tax breakdown for the success page. All three are in the smallest
      // currency unit (cents). subtotal + tax === total under Stripe Tax.
      amount_subtotal: amountSubtotal,
      amount_tax: amountTax,
      amount_total: amountTotal,
      currency: session.currency,
      provisioned,
      provisioning_error: provisioningError,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not load checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
