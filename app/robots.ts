/**
 * app/robots.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates robots.txt at the root of every host the app serves.
 *
 * Important: Next.js serves the SAME robots.txt for every host (the main site
 * AND every tenant subdomain). That's intentional — the rules below apply
 * uniformly: you want crawlers to index public landing pages, never to crawl
 * dashboards / APIs / form steps. We don't gain anything from per-tenant
 * robots variants right now.
 *
 * The sitemap reference is wired to `/sitemap.xml` on the same host. When
 * Googlebot crawls https://sara.solohub.nl/robots.txt it'll follow the
 * sitemap reference to https://sara.solohub.nl/sitemap.xml — which gives
 * us per-host sitemaps "for free" without any URL juggling.
 *
 * Things deliberately NOT blocked
 * -------------------------------
 *  • /book              — the booking landing page. This is the page we
 *                         most want indexed.
 *  • /about, /faq,
 *    /pricing, /contact — public marketing pages.
 *
 * Things blocked
 * --------------
 *  • /api/*       — never useful in search.
 *  • /admin/*     — super-admin tooling, gated by auth anyway.
 *  • /dashboard/* — owner UI.
 *  • /staff-portal/* — staff UI.
 *  • /book/staff, /book/time, /book/confirm, /book/success — booking flow
 *      steps. Indexing these gets you partially-filled forms in search
 *      results and dilutes the landing page's authority.
 *  • /review      — review-submission deep links (token-gated).
 */

import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hdr = await headers();
  // Honour the proxy's view of the host so subdomain requests get the
  // matching sitemap URL. `x-forwarded-host` wins on Vercel / behind
  // common proxies; `host` is the local fallback.
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host") ?? "solohub.nl";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/staff-portal/",
          "/book/staff",
          "/book/time",
          "/book/confirm",
          "/book/success",
          "/review",
        ],
      },
    ],
    sitemap: `${protocol}://${host}/sitemap.xml`,
  };
}
