import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { getStripeClient } from "@/lib/stripe";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/settings/account
 *
 * GDPR Art. 17 — Right to erasure.
 * Permanently deletes the calling tenant's account and all associated data.
 *
 * Body: { confirm: "<tenant-slug>" }
 *   The client must send the tenant slug as a typo-guard confirmation.
 *
 * On success → 200 { ok: true }   (client then signs out + redirects home)
 * On failure → 4xx / 5xx with { error: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require the user to type their slug as confirmation
    const body = await request.json().catch(() => ({}));
    const confirmValue = String(body?.confirm ?? "").trim().toLowerCase();
    if (confirmValue !== tenant.slug.toLowerCase()) {
      return NextResponse.json(
        { error: "Confirmation text doesn't match. Please type your account name exactly." },
        { status: 422 }
      );
    }

    // Cancel active Stripe subscription so we don't keep billing a deleted account
    if (tenant.stripe_subscription_id) {
      try {
        const stripe = getStripeClient();
        await stripe.subscriptions.cancel(tenant.stripe_subscription_id, {
          prorate: false,
        });
      } catch (stripeErr) {
        // Log but don't block deletion — the subscription may already be cancelled
        console.error("[delete-account] stripe cancel failed:", stripeErr);
      }
    }

    // Snapshot tenant info for notification before deleting
    const name = tenant.name as string;
    const email = tenant.owner_email as string;
    const slug = tenant.slug as string;

    // Delete the tenant row.
    // All related rows (staff, bookings, services, tokens, notifications, etc.)
    // are removed via ON DELETE CASCADE constraints defined in the schema.
    await pool.query(`DELETE FROM tenants WHERE id = $1`, [tenant.id]);

    // Notify founder — fire-and-forget
    void sendWhatsAppNotification(
      `🗑️ Account deleted on SoloHub\n\n` +
      `👤 ${name}\n` +
      `📧 ${email}\n` +
      `🔗 ${slug}\n` +
      `ℹ️ GDPR right to erasure request`
    ).catch(() => undefined);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete account.";
    console.error("[delete-account]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
