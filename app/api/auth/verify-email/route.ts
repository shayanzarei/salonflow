import pool from "@/lib/db";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/verify-email?token=<raw_token>
 *
 * Called when the user clicks the link in their verification email.
 * On success → redirects to /verify-email?verified=1
 * On failure → redirects to /verify-email?error=<reason>
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || request.nextUrl.origin;
  const base = appUrl.replace(/\/$/, "");

  const rawToken = request.nextUrl.searchParams.get("token")?.trim();
  if (!rawToken) {
    return NextResponse.redirect(`${base}/verify-email?error=missing_token`);
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  try {
    await pool.query("BEGIN");

    const result = await pool.query(
      `SELECT id, tenant_id, expires_at, used_at
       FROM email_verification_tokens
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash]
    );

    const row = result.rows[0] as {
      id: string;
      tenant_id: string;
      expires_at: string;
      used_at: string | null;
    } | undefined;

    if (!row) {
      await pool.query("ROLLBACK");
      return NextResponse.redirect(`${base}/verify-email?error=invalid_token`);
    }

    if (row.used_at) {
      await pool.query("ROLLBACK");
      return NextResponse.redirect(`${base}/verify-email?error=already_used`);
    }

    if (new Date(row.expires_at) < new Date()) {
      await pool.query("ROLLBACK");
      return NextResponse.redirect(`${base}/verify-email?error=expired`);
    }

    // Activate the account — move from pending_verification → trial
    await pool.query(
      `UPDATE tenants
       SET tenant_status   = 'trial',
           email_verified_at = NOW()
       WHERE id = $1`,
      [row.tenant_id]
    );

    // Mark token as consumed
    await pool.query(
      `UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`,
      [row.id]
    );

    await pool.query("COMMIT");

    // Fetch the tenant's email so we can include it in the WhatsApp notification
    const tenantResult = await pool.query(
      `SELECT owner_email, owner_first_name, owner_last_name, name FROM tenants WHERE id = $1`,
      [row.tenant_id]
    );
    const tenant = tenantResult.rows[0] as {
      owner_email: string;
      owner_first_name: string;
      owner_last_name: string;
      name: string;
    } | undefined;

    if (tenant) {
      void sendWhatsAppNotification(
        `✅ Email verified on SoloHub\n\n` +
        `👤 ${tenant.owner_first_name} ${tenant.owner_last_name}\n` +
        `📧 ${tenant.owner_email}\n` +
        `💼 ${tenant.name}\n` +
        `🎉 Trial started — 14 days`
      );
    }

    return NextResponse.redirect(`${base}/verify-email?verified=1`);
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => undefined);
    console.error("[verify-email]", error);
    return NextResponse.redirect(`${base}/verify-email?error=server_error`);
  }
}
