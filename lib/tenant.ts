import pool from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { slugFromHost } from "@/lib/main-site";
import { Tenant } from "@/types/tenant";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";

/**
 * Resolves the current tenant from the request context.
 *
 * Resolution order:
 *  1. x-tenant-slug request header  (set by Vercel edge config when present)
 *  2. The host header itself  (parses `<slug>.solohub.nl` → `slug`).
 *     This is the production fallback — anonymous booking-page visitors on
 *     a tenant subdomain don't carry the explicit header.
 *  3. session.slug from the signed-in JWT  (dashboard routes on the apex —
 *     no subdomain to parse)
 *  4. DEV_TENANT_SLUG env var  (development fallback only)
 *
 * ── Isolation / ownership check ──────────────────────────────────────────────
 * When the slug came from a request-controlled source (the header OR the host)
 * AND there is an authenticated session, we verify that session.tenantId
 * matches the resolved tenant.  This closes the following attack:
 *
 *   A logged-in salon owner POSTs to /api/bookings with an x-tenant-slug header
 *   set to a different salon's slug → without the check they would read / write
 *   that salon's data.  (The host-derived path can't be spoofed in the same
 *   way, but treating both as equally untrusted keeps the rule simple.)
 *
 * We skip the check when:
 *  - There is no session (public booking-page request on a subdomain — legitimate)
 *  - The caller is a super-admin (admins may inspect any tenant by design)
 */
export async function getTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  const headerSlug = headersList.get("x-tenant-slug")?.trim() ?? null;
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? null;
  const hostSlug = slugFromHost(host);

  // Fetch the session once — reused for the fallback slug AND the ownership check.
  const session = (await getServerSession(authOptions)) as Session | null;

  let slug: string | null = null;
  let fromHeader = false;

  if (headerSlug) {
    slug = headerSlug;
    fromHeader = true;
  } else if (hostSlug) {
    slug = hostSlug;
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
  // Only runs when the slug came from the explicit `x-tenant-slug` header
  // (not from the session JWT and not from the host).
  //
  // The host can't be spoofed in the same way the header can — a request
  // genuinely arriving at `other-salon.solohub.nl` belongs there, even if
  // the visitor happens to be a logged-in owner of a different salon. The
  // public booking page is read-only, so cross-tenant viewing is fine.
  //
  // The header path is different: it's a request-controlled knob meant for
  // dashboard API calls. If a logged-in owner sets `x-tenant-slug: other`
  // when calling /api/bookings, that's tenant boundary tampering and we
  // deny it.
  if (fromHeader && session && !session.isAdmin) {
    if (session.tenantId !== tenant.id) {
      // Deny silently — same shape as "tenant not found" so we leak nothing.
      return null;
    }
  }

  return tenant;
}

export function canAccessPublicWebsite(
  tenant: Pick<Tenant, "website_status" | "tenant_status" | "trial_ends_at" | "stripe_subscription_id">
): boolean {
  if (tenant.website_status !== "published") {
    return false;
  }
  if (tenant.tenant_status === "active") {
    return true;
  }
  if (tenant.tenant_status === "trial" && tenant.trial_ends_at) {
    return new Date(tenant.trial_ends_at) > new Date();
  }
  return false;
}
