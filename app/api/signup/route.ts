import pool from "@/lib/db";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type SignupPayload = {
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  password?: string;
  company?: string;
  role?: string;
  marketingOptIn?: boolean;
};

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload;

    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const workEmail = (body.workEmail ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const company = (body.company ?? "").trim();
    const role = (body.role ?? "").trim();

    if (!firstName || !lastName || !workEmail || !password || !role) {
      return NextResponse.json(
        { error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const salonName = company || `${firstName} ${lastName} Studio`;
    const slug = await generateUniqueSlug(company || `${firstName}-${lastName}`);
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query("BEGIN");
    const tenant = await pool.query(
      `INSERT INTO tenants (
         name,
         slug,
         owner_email,
         owner_first_name,
         owner_last_name,
         owner_role,
         plan_tier,
         primary_color,
         password_hash,
         website_template,
         tenant_status,
         website_status,
         trial_started_at,
         trial_ends_at,
         is_admin
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         'hub',
         '#11c4b6',
         $7,
         'signuture',
         'trial',
         'draft',
         NOW(),
         NOW() + INTERVAL '14 days',
         false
       )
       RETURNING id, slug, name`,
      [salonName, slug, workEmail, firstName, lastName, role, passwordHash]
    );
    const tenantId = tenant.rows[0].id as string;
    await pool.query(
      `INSERT INTO staff (tenant_id, name, role, email)
       VALUES ($1, $2, $3, $4)`,
      [tenantId, `${firstName} ${lastName}`.trim(), role, workEmail]
    );
    await pool.query("COMMIT");

    void sendWhatsAppNotification(
      `🎉 New signup on SoloHub\n\n` +
      `👤 ${firstName} ${lastName}\n` +
      `📧 ${workEmail}\n` +
      `💼 ${salonName}\n` +
      `🏷️ ${role}`
    );

    return NextResponse.json(
      {
        ok: true,
        tenantId: tenant.rows[0].id,
        slug: tenant.rows[0].slug,
        tenantName: tenant.rows[0].name,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    await pool.query("ROLLBACK").catch(() => undefined);
    const message =
      error instanceof Error ? error.message : "Unable to create account.";

    if (message.includes("duplicate key value")) {
      return NextResponse.json(
        { error: "This account already exists. Please sign in." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
