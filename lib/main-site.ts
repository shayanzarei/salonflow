const MAIN_SITE_HOSTS = new Set([
  "localhost",
  "localhost:3000",
  "localhost:3001",
  "solohub.nl",
  "www.solohub.nl",
]);

export function isMainSiteHost(host: string | null | undefined) {
  if (!host) return false;
  return MAIN_SITE_HOSTS.has(host.toLowerCase());
}

/**
 * Extract a tenant slug from the request host.
 *
 * `salon-name.solohub.nl` → `"salon-name"`. Returns `null` for the marketing
 * apex (`solohub.nl`, `www.solohub.nl`), for `localhost`, and for anything
 * that isn't a single-label subdomain of solohub.nl.
 *
 * This is the production fallback when no `x-tenant-slug` header is present —
 * which is the common case for anonymous booking-page visitors hitting a
 * tenant subdomain directly.
 */
export function slugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const normalized = host.toLowerCase().split(":")[0]; // strip port
  if (isMainSiteHost(host)) return null;
  // Match exactly one DNS label in front of `.solohub.nl`.
  const m = normalized.match(/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.solohub\.nl$/);
  return m ? m[1] : null;
}
