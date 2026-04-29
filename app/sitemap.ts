/**
 * app/sitemap.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Per-host sitemap.xml generator.
 *
 * Two cases to handle, depending on which host Googlebot is asking:
 *
 *  1. Main marketing host (solohub.nl, www.solohub.nl, localhost in dev)
 *     → list every published tenant's landing page (one entry per
 *       https://{slug}.solohub.nl/) plus the marketing pages.
 *     This is the discovery index Google uses to find every salon.
 *
 *  2. Tenant subdomain (sara.solohub.nl)
 *     → list just the public pages on that host: /, /about, /contact, /faq,
 *       /pricing, /privacy. The booking flow steps stay out (already
 *       blocked in robots.ts) but the landing page itself is the canonical
 *       indexable URL for that salon.
 *
 * "Published" = website_status = 'published' AND tenant_status NOT IN
 * ('suspended', 'draft'). canAccessPublicWebsite() in lib/tenant.ts
 * implements the same rule for runtime; we mirror it here so the sitemap
 * never advertises a URL that returns 404.
 *
 * `lastModified` heuristic: tenants.created_at if we don't track edits.
 * Once we have a `tenants.updated_at` column wired into the content-edit
 * routes, swap it in. Crawlers don't trust this field much; it's mostly
 * a hint about how often to re-fetch.
 */

import type { MetadataRoute } from "next";
import pool from "@/lib/db";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";

// Pages on every tenant subdomain that are safe to advertise. Keep this in
// sync with the public routes under app/(booking)/ — adding a marketing page
// without listing it here means crawlers won't find it via the sitemap.
const TENANT_PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/pricing",
  "/privacy",
] as const;

// Same list of pages on the main marketing host. We could vary these per
// host later if e.g. /pricing only makes sense on the main site; for now
// the booking templates ship the same set of pages, so it's identical.
const MAIN_SITE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/pricing",
  "/privacy",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host") ?? "solohub.nl";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  // ── Case 2: tenant subdomain ────────────────────────────────────────────
  //   Cheap path: just static pages on this host. We don't need to query
  //   the DB because we know which routes exist.
  if (!isMainSiteHost(host)) {
    return TENANT_PUBLIC_PATHS.map((path) => ({
      url: `${protocol}://${host}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.5,
    }));
  }

  // ── Case 1: main marketing host ─────────────────────────────────────────
  //   List every published tenant's landing page so Google can discover
  //   them. Marketing pages of the main site come first.
  const mainSiteEntries: MetadataRoute.Sitemap = MAIN_SITE_PATHS.map((path) => ({
    url: `${protocol}://${host}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));

  // Same predicate as canAccessPublicWebsite() in lib/tenant.ts:
  //   website_status = 'published'
  //   AND tenant_status = 'active' OR (tenant_status='trial' AND trial valid)
  // We do this in SQL so we don't materialise every tenant in node memory.
  const tenantsRes = await pool.query(
    `SELECT slug, COALESCE(created_at, NOW()) AS last_modified
       FROM tenants
       WHERE website_status = 'published'
         AND (
              tenant_status = 'active'
           OR (tenant_status = 'trial' AND trial_ends_at IS NOT NULL AND trial_ends_at > NOW())
         )
       ORDER BY slug`
  );

  const tenantEntries: MetadataRoute.Sitemap = tenantsRes.rows.map((row) => ({
    url: `${protocol}://${row.slug}.solohub.nl/`,
    lastModified: new Date(row.last_modified),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...mainSiteEntries, ...tenantEntries];
}
