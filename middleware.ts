import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Routes that are always accessible regardless of trial/subscription status.
 */
const ALWAYS_ALLOWED = [
  "/login",
  "/signup",
  "/reset-password",
  "/forgot-password",
  "/pricing",
  "/settings/billing",
  "/api/auth",
  "/api/stripe",
  "/api/webhooks",
  "/api/signup",
  "/api/billing",
];

function isAlwaysAllowed(pathname: string) {
  return ALWAYS_ALLOWED.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate dashboard routes — skip public/api/auth paths
  if (isAlwaysAllowed(pathname)) {
    return NextResponse.next();
  }

  // Only enforce on dashboard (not admin, not public booking pages)
  const isDashboard =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/favicon");

  if (!isDashboard) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in → let NextAuth handle the redirect
  if (!token || token.isAdmin) {
    return NextResponse.next();
  }

  const slug = token.slug as string | undefined;
  if (!slug) return NextResponse.next();

  // Fetch tenant status — lightweight query (slug is indexed)
  const result = await pool.query(
    `SELECT tenant_status, trial_ends_at, stripe_subscription_id FROM tenants WHERE slug = $1`,
    [slug]
  );

  const tenant = result.rows[0] as {
    tenant_status: string;
    trial_ends_at: string | null;
    stripe_subscription_id: string | null;
  } | undefined;

  if (!tenant) return NextResponse.next();

  const { tenant_status, trial_ends_at, stripe_subscription_id } = tenant;

  // Active subscription — always let through
  if (tenant_status === "active" && stripe_subscription_id) {
    return NextResponse.next();
  }

  // Trial — allow until trial_ends_at
  if (tenant_status === "trial" && trial_ends_at) {
    const trialEnd = new Date(trial_ends_at);
    if (trialEnd > new Date()) {
      return NextResponse.next();
    }
    // Trial expired — redirect to billing
    const url = request.nextUrl.clone();
    url.pathname = "/settings/billing";
    url.searchParams.set("expired", "1");
    return NextResponse.redirect(url);
  }

  // Suspended or unknown — redirect to billing
  if (tenant_status === "suspended") {
    const url = request.nextUrl.clone();
    url.pathname = "/settings/billing";
    url.searchParams.set("suspended", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - public booking subdomains (handled separately via x-tenant-slug header)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
