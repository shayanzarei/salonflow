import pool from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { getStripeClient } from "@/lib/stripe";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/admin/tenants/[id]
 *
 * Super-admin endpoint to permanently delete any tenant account and all its data.
 * Cancels any active Stripe subscription first.
 *
 * Body: { confirm: "<tenant-slug>" }  — typo-guard confirmation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Fetch tenant before deleting so we can confirm slug + notify
    const tenantResult = await pool.query(
      `SELECT id, name, slug, owner_email, stripe_subscription_id
       FROM tenants WHERE id = $1`,
      [id]
    );
    const tenant = tenantResult.rows[0] as {
      id: string;
      name: string;
      slug: string;
      owner_email: string;
      stripe_subscription_id: string | null;
    } | undefined;

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Require confirmation slug from the request body
    const body = await request.json().catch(() => ({}));
    const confirmValue = String(body?.confirm ?? "").trim().toLowerCase();
    if (confirmValue !== tenant.slug.toLowerCase()) {
      return NextResponse.json(
        { error: "Confirmation text doesn't match. Type the tenant slug exactly." },
        { status: 422 }
      );
    }

    // Cancel Stripe subscription if active
    if (tenant.stripe_subscription_id) {
      try {
        const stripe = getStripeClient();
        await stripe.subscriptions.cancel(tenant.stripe_subscription_id, {
          prorate: false,
        });
      } catch (stripeErr) {
        console.error("[admin delete-tenant] stripe cancel failed:", stripeErr);
      }
    }

    // Hard delete — cascades to all related tables
    await pool.query(`DELETE FROM tenants WHERE id = $1`, [id]);

    // Notify founder
    void sendWhatsAppNotification(
      `🗑️ Tenant DELETED by admin on SoloHub\n\n` +
      `👤 ${tenant.name}\n` +
      `📧 ${tenant.owner_email}\n` +
      `🔗 ${tenant.slug}`
    ).catch(() => undefined);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete tenant.";
    console.error("[admin delete-tenant]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
