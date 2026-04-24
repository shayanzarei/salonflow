import pool from "@/lib/db";
import { passwordResetEmail } from "@/lib/emails/password-reset";
import { sendEmail } from "@/lib/emails/send";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const RESET_TOKEN_TTL_MINUTES = 60;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function generateUniqueSlug(baseInput: string) {
  const base = slugify(baseInput) || "salon";
  let candidate = base;
  let index = 1;

  while (true) {
    const existing = await pool.query("SELECT 1 FROM tenants WHERE slug = $1 LIMIT 1", [
      candidate,
    ]);
    if (existing.rowCount === 0) return candidate;
    index += 1;
    candidate = `${base}-${index}`;
  }
}

function buildSetupUrl(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
  }
  return `http://localhost:3000/reset-password?token=${token}`;
}

export type ProvisioningInput = {
  stripeCustomerId: string;
  customerEmail: string;
  stripeSubscriptionId?: string | null;
  plan?: string | null;
};

/** Link Stripe customer to existing owner email, or create tenant and send setup email. */
export async function runProvisioningJob(input: ProvisioningInput) {
  const customerEmail = input.customerEmail.trim().toLowerCase();
  if (!customerEmail) {
    return { ok: false as const, reason: "missing_email" as const };
  }

  const planTier =
    input.plan === "hub" || input.plan === "agency" || input.plan === "solo"
      ? input.plan
      : "solo";

  await pool.query("BEGIN");
  try {
    const existingTenant = await pool.query(
      `SELECT t.id
       FROM tenants t
       WHERE LOWER(t.owner_email) = $1
       UNION
       SELECT s.tenant_id AS id
       FROM staff s
       WHERE LOWER(s.email) = $1
       LIMIT 1`,
      [customerEmail]
    );

    if (existingTenant.rows[0]?.id) {
      const tenantId = existingTenant.rows[0].id as string;
      await pool.query(
        `UPDATE tenants
         SET stripe_customer_id = $1,
             stripe_subscription_id = COALESCE($2, stripe_subscription_id),
             plan_tier = COALESCE($3, plan_tier),
             tenant_status = CASE WHEN tenant_status = 'suspended' THEN tenant_status ELSE 'active' END
         WHERE id = $4`,
        [input.stripeCustomerId, input.stripeSubscriptionId ?? null, planTier, tenantId]
      );
      await pool.query("COMMIT");
      return { ok: true as const, created: false as const, tenantId };
    }

    const emailPrefix = customerEmail.split("@")[0] || "owner";
    const cleanPrefix = emailPrefix
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim();
    const ownerFirstName = cleanPrefix
      ? cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1)
      : "Owner";
    const ownerLastName = "";
    const salonName = `${ownerFirstName}'s Salon`;
    const slug = await generateUniqueSlug(cleanPrefix || "salon");
    const temporaryPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);

    const insertedTenant = await pool.query(
      `INSERT INTO tenants (
         name, slug, owner_email, owner_first_name, owner_last_name, owner_role,
         plan_tier, primary_color, password_hash,
         website_template, tenant_status, website_status, trial_started_at, trial_ends_at,
         stripe_customer_id, stripe_subscription_id, is_admin
       )
       VALUES (
         $1, $2, $3, $4, $5, 'owner',
         $6, '#7C3AED', $7,
         'signuture', 'active', 'draft', NOW(), NOW() + INTERVAL '14 days',
         $8, $9, false
       )
       RETURNING id`,
      [
        salonName,
        slug,
        customerEmail,
        ownerFirstName,
        ownerLastName,
        planTier,
        temporaryPasswordHash,
        input.stripeCustomerId,
        input.stripeSubscriptionId ?? null,
      ]
    );

    const tenantId = insertedTenant.rows[0].id as string;
    await pool.query(
      `INSERT INTO staff (tenant_id, name, role, email)
       VALUES ($1, $2, 'owner', $3)`,
      [tenantId, ownerFirstName, customerEmail]
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await pool.query(
      `INSERT INTO password_reset_tokens (tenant_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + ($3::text || ' minutes')::interval)`,
      [tenantId, tokenHash, RESET_TOKEN_TTL_MINUTES]
    );

    await pool.query("COMMIT");

    const setupUrl = buildSetupUrl(rawToken);
    const emailPayload = passwordResetEmail({ resetUrl: setupUrl, variant: "setup" });
    await sendEmail({
      to: customerEmail,
      subject: emailPayload.subject,
      html: emailPayload.html,
      from: "SoloHub <hello@solohub.nl>",
    });

    return { ok: true as const, created: true as const, tenantId };
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}
