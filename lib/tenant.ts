import pool from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { Tenant } from "@/types/tenant";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";

/**
 * Resolves the current tenant from the request context.
 *
 * Resolution order:
 *  1. x-tenant-slug request header  (set by Vercel edge config for *.solohub.nl subdomains)
 *  2. session.slug from the signed-in JWT  (dashboard routes — no subdomain header)
 *  3. DEV_TENANT_SLUG env var  (development fallback only)
 *
 * ── Isolation / ownership check ──────────────────────────────────────────────
 * When the slug is taken from the x-tenant-slug header AND there is an
 * authenticated session, we verify that session.tenantId matches the resolved
 * tenant.  This closes the following attack:
 *
 *   A logged-in salon owner POSTs to /api/bookings with an x-tenant-slug header
 *   set to a different salon's slug → without the check they would read / write
 *   that salon's data.
 *
 * We skip the check when:
 *  - There is no session (public booking-page request on a subdomain — legitimate)
 *  - The caller is a super-admin (admins may inspect any tenant by design)
 */
export async function getTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  const headerSlug = headersList.get("x-tenant-slug")?.trim() ?? null;

  // Fetch the session once — reused for the fallback slug AND the ownership check.
  const session = (await getServerSession(authOptions)) as Session | null;

  let slug: string | null = null;
  let fromHeader = false;

  if (headerSlug) {
    slug = headerSlug;
    fromHeader = true;
  } else if (session?.slug && !session.isAdmin) {
    // Dashboard path: slug comes straight from the signed JWT — already trustworthy.
    slug = session.slug;
  } else if (process.env.NODE_ENV === "development") {
    slug = process.env.DEV_TENANT_SLUG ?? null;
  }

  if (!slug) return null;

  const result = await pool.query(
    "SELECT * FROM tenants WHERE slug = $1",
    [slug]
  );
  const tenant = (result.rows[0] as Tenant) ?? null;

  if (!tenant) return null;

  // ── Ownership guard ───────────────────────────────────────────────────────
  // Only runs when the slug came from the header (not from the session JWT).
  // If there is an authenticated non-admin session, the session's tenantId
  // must match the tenant we just resolved.  A mismatch means the caller
  // fabricated or tampered with the header to reach another tenant's data.
  if (fromHeader && session && !session.isAdmin) {
    if (session.tenantId !== tenant.id) {
      // Deny silently — same shape as "tenant not found" so we leak nothing.
      return null;
    }
  }

  return tenant;
}
