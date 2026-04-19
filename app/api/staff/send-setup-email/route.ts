import { passwordResetEmail } from "@/lib/emails/password-reset";
import { sendEmail } from "@/lib/emails/send";
import pool from "@/lib/db";
import { requireOwner } from "@/lib/require-owner";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const INVITE_TOKEN_TTL_MINUTES = 60 * 24 * 7;

function buildStaffInviteUrl(request: NextRequest, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  }
  return `${request.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function POST(request: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const body = (await request.json()) as {
    staffId?: string;
    tenantId?: string;
  };
  const staffId = body.staffId?.trim();
  const tenantId = body.tenantId?.trim();

  if (!staffId || !tenantId || tenantId !== guard.session.tenantId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const staffRow = await pool.query(
      `SELECT id, email, name FROM staff WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [staffId, tenantId]
    );
    const row = staffRow.rows[0] as
      | { id: string; email: string; name: string }
      | undefined;
    if (!row?.email) {
      return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    }

    await pool.query(
      `UPDATE staff_invite_tokens
       SET used_at = NOW()
       WHERE staff_id = $1 AND used_at IS NULL`,
      [staffId]
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await pool.query(
      `INSERT INTO staff_invite_tokens (staff_id, tenant_id, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + ($4::text || ' minutes')::interval)`,
      [staffId, tenantId, tokenHash, String(INVITE_TOKEN_TTL_MINUTES)]
    );

    const setupUrl = buildStaffInviteUrl(request, rawToken);
    const payload = passwordResetEmail({ resetUrl: setupUrl, variant: "setup" });
    await sendEmail({
      to: row.email,
      subject: payload.subject,
      html: payload.html,
      from: "SoloHub <hello@solohub.nl>",
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to send setup email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
