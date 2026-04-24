import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { normalizeWebsiteTemplate } from "@/lib/website-templates";
import { sendEmail } from "@/lib/emails/send";
import { passwordResetEmail } from "@/lib/emails/password-reset";
import crypto from "crypto";

const RESET_TOKEN_TTL_MINUTES = 60;

function buildSetupUrl(request: NextRequest, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
  }
  return `${request.nextUrl.origin}/reset-password?token=${token}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const owner_first_name = (formData.get("owner_first_name") as string)?.trim();
    const owner_last_name = (formData.get("owner_last_name") as string)?.trim();
    const owner_email = (formData.get("owner_email") as string)?.trim().toLowerCase();
    const owner_role = (formData.get("owner_role") as string)?.trim();
    const slug = formData.get('slug') as string;
    const plan_tier = formData.get('plan_tier') as string;
    const primary_color = formData.get('primary_color') as string;
    const business_started_at = (formData.get("business_started_at") as string) || null;
    const website_template = normalizeWebsiteTemplate(
      formData.get("website_template") as string | null
    );
    const normalizedSlug = slug?.trim().toLowerCase();

    if (
      !name?.trim() ||
      !owner_first_name ||
      !owner_last_name ||
      !owner_email ||
      !owner_role ||
      !normalizedSlug
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and dashes." },
        { status: 400 }
      );
    }

    const temporaryPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);

    await pool.query("BEGIN");
    const insertResult = await pool.query(
      `INSERT INTO tenants (
         name, slug, owner_email, owner_first_name, owner_last_name, owner_role,
         plan_tier, primary_color, password_hash,
         website_template, business_started_at,
         tenant_status, website_status, trial_started_at, trial_ends_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9,
         $10, $11,
         'trial', 'draft', NOW(), NOW() + INTERVAL '14 days'
       )
       RETURNING id`,
      [
        name.trim(),
        normalizedSlug,
        owner_email,
        owner_first_name,
        owner_last_name,
        owner_role,
        plan_tier,
        primary_color || "#7C3AED",
        temporaryPasswordHash,
        website_template,
        business_started_at,
      ]
    );

    const tenantId = insertResult.rows[0]?.id as string;
    await pool.query(
      `INSERT INTO staff (tenant_id, name, role, email)
       VALUES ($1, $2, $3, $4)`,
      [tenantId, `${owner_first_name} ${owner_last_name}`.trim(), owner_role, owner_email]
    );
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await pool.query(
      `INSERT INTO password_reset_tokens (tenant_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3::text || ' minutes')::interval)`,
      [tenantId, tokenHash, RESET_TOKEN_TTL_MINUTES]
    );

    const setupUrl = buildSetupUrl(req, rawToken);
    const emailPayload = passwordResetEmail({ resetUrl: setupUrl, variant: "setup" });
    await sendEmail({
      to: owner_email,
      subject: emailPayload.subject,
      html: emailPayload.html,
      from: "SoloHub <hello@solohub.nl>",
    });
    await pool.query("COMMIT");

    return NextResponse.redirect(
      new URL('/admin/tenants', req.url)
    );
  } catch (err: unknown) {
    await pool.query("ROLLBACK").catch(() => undefined);
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}