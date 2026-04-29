/**
 * lib/seo/auto-meta.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auto-generated SEO copy for tenant landing pages.
 *
 * Why this exists
 * ---------------
 * Most salons will never touch SEO settings. We need their public page to
 * rank reasonably *out of the box* — the day they're created, before they've
 * hand-written a single character of copy. This module produces a sensible
 * <title> and <meta name="description"> from whatever data the tenant has
 * already filled in (name, services, city). Super-admin can override either
 * value via tenants.seo_title / tenants.meta_description; the override path
 * is just `if (tenant.seo_title) return tenant.seo_title; else autoTitle()`.
 *
 * Length budgets
 * --------------
 * Google truncates <title> around 60 chars and the meta description around
 * 155–160 chars. We aim for ~55 / ~155 with graceful fallbacks if the tenant
 * has very little data.
 */

import type { Tenant } from "@/types/tenant";

// Practical caps before Google truncates with an ellipsis. Slightly under the
// hard limits so we don't sit on the boundary.
const TITLE_BUDGET = 60;
const DESCRIPTION_BUDGET = 160;

export interface ServiceLite {
  name: string;
  category_name?: string | null;
}

/**
 * Pull the city out of a free-text address. We don't have structured address
 * fields, and salon owners write addresses in wildly different shapes
 * ("Prinsengracht 123, 1015 Amsterdam", "Damrak 1 1012LG Amsterdam, NL", etc).
 * The heuristic: take the last comma-separated chunk, strip postal codes,
 * country suffixes, and trailing whitespace. If the result is too short or
 * too long to plausibly be a city name, return null and let the caller fall
 * back to a city-less template.
 *
 * This is intentionally forgiving: a wrong city in a meta description is
 * less bad than no city at all. The owner can always override.
 */
export function extractCityFromAddress(address: string | null): string | null {
  if (!address) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;

  // Take the last comma-separated chunk.
  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  let candidate = parts[parts.length - 1];

  // Strip a trailing ", NL" / ", Netherlands" if it slipped past the split.
  candidate = candidate.replace(/\b(NL|Netherlands|Nederland)\b\s*$/i, "").trim();

  // Strip postal codes:
  //  • Dutch: "1015 LD" or "1015LD" (4 digits + optional space + 2 letters)
  //  • Generic: leading digits followed by space ("1015 Amsterdam" → "Amsterdam")
  candidate = candidate.replace(/\b\d{4}\s?[A-Z]{2}\b/i, "").trim();
  candidate = candidate.replace(/^\d{4,5}\s+/, "").trim();

  // Reject implausibly short / long candidates (probably a street fragment
  // or a free-form note rather than a city name).
  if (candidate.length < 2 || candidate.length > 40) return null;
  return candidate;
}

/**
 * Build the auto-generated <title>. Override > city-aware > bare fallback.
 *
 *   With city:    "Sara Cuts — Book online in Amsterdam"
 *   No city:      "Sara Cuts — Book your appointment online"
 *
 * The em-dash separator is intentional: Google's title rewriter is more
 * likely to keep the salon name as the prefix when there's a clean separator.
 */
export function autoTitle(
  tenant: Pick<Tenant, "name" | "address" | "seo_title">
): string {
  if (tenant.seo_title?.trim()) return tenant.seo_title.trim();

  const city = extractCityFromAddress(tenant.address ?? null);
  const base = city
    ? `${tenant.name} — Book online in ${city}`
    : `${tenant.name} — Book your appointment online`;

  return truncate(base, TITLE_BUDGET);
}

/**
 * Build the auto-generated meta description. Override > service-aware >
 * about-text > generic fallback.
 *
 * Service-aware: pulls 2–3 unique service categories (or service names if
 * categories aren't set), dedupes case-insensitively, and stitches into:
 *   "Book a haircut, color, or styling appointment with Sara Cuts in
 *    Amsterdam. Online booking available 24/7."
 *
 * About-text fallback: if the tenant has filled in `about` but no services,
 * use the first 155 chars of about — it's already the salon's own pitch.
 *
 * Generic fallback: "Book your appointment online with Sara Cuts."
 */
export function autoDescription(
  tenant: Pick<Tenant, "name" | "address" | "about" | "tagline" | "meta_description">,
  services: ServiceLite[]
): string {
  if (tenant.meta_description?.trim()) {
    return truncate(tenant.meta_description.trim(), DESCRIPTION_BUDGET);
  }

  const city = extractCityFromAddress(tenant.address ?? null);
  const cityClause = city ? ` in ${city}` : "";

  // Path 1: service-aware. Best for SEO because we hit specific service
  // keywords ("haircut", "balayage", "facial") that customers actually search.
  const offerings = uniqueOfferings(services);
  if (offerings.length > 0) {
    const list = formatOfferings(offerings);
    const desc = `Book a ${list} appointment with ${tenant.name}${cityClause}. Online booking available 24/7.`;
    return truncate(desc, DESCRIPTION_BUDGET);
  }

  // Path 2: tagline if it exists — already the owner's chosen positioning.
  if (tenant.tagline?.trim()) {
    const desc = `${tenant.tagline.trim()} Book online with ${tenant.name}${cityClause}.`;
    return truncate(desc, DESCRIPTION_BUDGET);
  }

  // Path 3: about text. Good because it's the owner's own copy.
  if (tenant.about?.trim()) {
    return truncate(tenant.about.trim(), DESCRIPTION_BUDGET);
  }

  // Path 4: bare fallback. Generic but always works.
  return truncate(
    `Book your appointment online with ${tenant.name}${cityClause}.`,
    DESCRIPTION_BUDGET
  );
}

/**
 * Pick up to 3 unique offerings, preferring categories over service names.
 * Categories are usually broader and more search-friendly ("haircut" beats
 * "Signature Cut + Style Premium"), but if a tenant hasn't set up
 * categories we fall back to the service names.
 *
 * Dedupe is case-insensitive so "Haircut" and "haircut" don't both appear.
 */
function uniqueOfferings(services: ServiceLite[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  // First pass: categories.
  for (const s of services) {
    const cat = s.category_name?.trim();
    if (!cat) continue;
    const key = cat.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cat.toLowerCase());
    if (result.length >= 3) return result;
  }

  // Second pass: service names, only if we didn't get enough categories.
  if (result.length === 0) {
    for (const s of services) {
      const name = s.name?.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(name.toLowerCase());
      if (result.length >= 3) return result;
    }
  }

  return result;
}

/**
 * Format ["haircut", "color", "styling"] → "haircut, color, or styling".
 * Single item: just the item. Two items: "X or Y". Three+: "A, B, or C".
 * Oxford comma is intentional — it parses unambiguously when speech
 * synthesisers read meta descriptions out loud (more common than you'd think
 * with accessibility tools).
 */
function formatOfferings(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

/**
 * Truncate at a word boundary so we never end mid-word with an ellipsis.
 * If the last word would push us over budget, cut before it and append "…".
 */
function truncate(s: string, budget: number): string {
  if (s.length <= budget) return s;
  const slice = s.slice(0, budget - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > budget * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}
