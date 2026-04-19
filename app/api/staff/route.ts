import { passwordResetEmail } from "@/lib/emails/password-reset";
import { sendEmail } from "@/lib/emails/send";
import { staffInviteOwnerNoticeEmail } from "@/lib/emails/staff-invite-owner";
import pool from "@/lib/db";
import { requireOwner } from "@/lib/require-owner";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const INVITE_TOKEN_TTL_MINUTES = 60 * 24 * 7; // 7 days

function buildStaffInviteUrl(request: NextRequest, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  }
  return `${request.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`;
}

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL("/staff/new", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const ownerTenantId = guard.session.tenantId as string;

  try {
    const formData = await req.formData();

    const tenant_id = (formData.get("tenant_id") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();

    if (tenant_id !== ownerTenantId) {
      return redirectWithError(req, "Something went wrong. Please try again.");
    }
    if (!name || !role || !email) {
      return redirectWithError(req, "Please fill in all fields.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return redirectWithError(req, "Invalid email address.");
    }

    const dup = await pool.query(
      `SELECT id, password_hash IS NOT NULL AS has_password
       FROM staff
       WHERE tenant_id = $1 AND LOWER(email) = LOWER($2)
       LIMIT 1`,
      [tenant_id, email]
    );
    if (dup.rows[0]?.has_password) {
      return redirectWithError(
        req,
        "This email already has portal access on your team."
      );
    }
    if (dup.rows[0]?.id) {
      return redirectWithError(
        req,
        "This email is already on your team. Use a different address."
      );
    }

    const tenantRow = await pool.query(
      `SELECT name, owner_email FROM tenants WHERE id = $1 LIMIT 1`,
      [tenant_id]
    );
    const salonName = (tenantRow.rows[0]?.name as string) ?? "Your salon";
    const ownerEmail =
      (tenantRow.rows[0]?.owner_email as string | null)?.trim().toLowerCase() ??
      null;

    await pool.query("BEGIN");
    const insertStaff = await pool.query(
      `INSERT INTO staff (tenant_id, name, role, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [tenant_id, name, role, email]
    );
    const staffId = insertStaff.rows[0].id as string;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await pool.query(
      `INSERT INTO staff_invite_tokens (staff_id, tenant_id, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + ($4::text || ' minutes')::interval)`,
      [staffId, tenant_id, tokenHash, String(INVITE_TOKEN_TTL_MINUTES)]
    );
    await pool.query("COMMIT");

    const setupUrl = buildStaffInviteUrl(req, rawToken);
    const staffEmailPayload = passwordResetEmail({
      resetUrl: setupUrl,
      variant: "setup",
    });
    await sendEmail({
      to: email,
      subject: staffEmailPayload.subject,
      html: staffEmailPayload.html,
      from: "SoloHub <hello@solohub.nl>",
    });

    if (ownerEmail) {
      const ownerPayload = staffInviteOwnerNoticeEmail({
        salonName,
        inviteeName: name,
        inviteeEmail: email,
      });
      await sendEmail({
        to: ownerEmail,
        subject: ownerPayload.subject,
        html: ownerPayload.html,
        from: "SoloHub <hello@solohub.nl>",
      });
    }

    return NextResponse.redirect(new URL("/staff?invited=1", req.url), 303);
  } catch (err: unknown) {
    await pool.query("ROLLBACK").catch(() => undefined);
    const message =
      err instanceof Error ? err.message : "Could not send invite.";
    if (
      message.includes("staff_invite_tokens") ||
      message.includes("does not exist")
    ) {
      return redirectWithError(
        req,
        "Database migration missing: run 015_staff_invite_tokens.sql"
      );
    }
    return redirectWithError(req, message);
  }
}
