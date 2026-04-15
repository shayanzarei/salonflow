import pool from "@/lib/db";
import { sendEmail } from "@/lib/emails/send";
import { passwordResetEmail } from "@/lib/emails/templates";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const RESET_TOKEN_TTL_MINUTES = 60;

function buildResetUrl(request: NextRequest, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
  }
  const origin = request.nextUrl.origin;
  return `${origin}/reset-password?token=${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const tenantResult = await pool.query(
      `SELECT id, owner_email
       FROM tenants
       WHERE LOWER(owner_email) = $1
       LIMIT 1`,
      [email]
    );

    if (tenantResult.rows[0]) {
      const tenantId: string = tenantResult.rows[0].id;
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await pool.query(
        `INSERT INTO password_reset_tokens (tenant_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + ($3::text || ' minutes')::interval)`,
        [tenantId, tokenHash, RESET_TOKEN_TTL_MINUTES]
      );

      const resetUrl = buildResetUrl(request, rawToken);
      const emailPayload = passwordResetEmail({ resetUrl });
      await sendEmail({
        to: email,
        subject: emailPayload.subject,
        html: emailPayload.html,
        from: "SoloHub <hello@solohub.nl>",
      });
    }

    // Always return generic success to avoid account enumeration.
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
