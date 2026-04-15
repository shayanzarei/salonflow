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
