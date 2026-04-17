import pool from "@/lib/db";
import { emailVerificationEmail } from "@/lib/emails/email-verification";
import { sendEmail } from "@/lib/emails/send";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const VERIFICATION_TOKEN_TTL_HOURS = 24;
// Prevent spamming: only allow resend if the last token was created > 60s ago
const RESEND_COOLDOWN_SECONDS = 60;

function buildVerifyUrl(token: string, origin: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = appUrl ? appUrl.replace(/\/$/, "") : origin;
  return `${base}/api/auth/verify-email?token=${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Look up tenant — only resend for accounts still awaiting verification
    const tenantResult = await pool.query(
      `SELECT id FROM tenants
       WHERE LOWER(owner_email) = $1
         AND tenant_status = 'pending_verification'
       LIMIT 1`,
      [email]
    );

    // Return generic success even if not found — prevents account enumeration
    if (!tenantResult.rows[0]) {
      return NextResponse.json({ ok: true });
    }

    const tenantId = tenantResult.rows[0].id as string;

    // Check cooldown — don't allow resend if a token was just created
    const recentToken = await pool.query(
      `SELECT created_at FROM email_verification_tokens
       WHERE tenant_id = $1
         AND used_at IS NULL
         AND created_at > NOW() - ($2::text || ' seconds')::interval
       ORDER BY created_at DESC
       LIMIT 1`,
      [tenantId, RESEND_COOLDOWN_SECONDS]
    );

    if (recentToken.rows[0]) {
      return NextResponse.json(
        { error: "Please wait a moment before requesting another email." },
        { status: 429 }
      );
    }

    // Invalidate all previous unused tokens for this tenant
    await pool.query(
      `DELETE FROM email_verification_tokens
       WHERE tenant_id = $1 AND used_at IS NULL`,
      [tenantId]
    );

    // Generate and store a new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await pool.query(
      `INSERT INTO email_verification_tokens (tenant_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3::text || ' hours')::interval)`,
      [tenantId, tokenHash, VERIFICATION_TOKEN_TTL_HOURS]
    );

    // Send the email
    const verifyUrl = buildVerifyUrl(rawToken, request.nextUrl.origin);
    const { subject, html } = emailVerificationEmail({ verifyUrl });
    await sendEmail({
      to: email,
      subject,
      html,
      from: "SoloHub <hello@solohub.nl>",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[resend-verification]", error);
    return NextResponse.json({ error: "Could not resend email." }, { status: 500 });
  }
}
