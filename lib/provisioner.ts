/**
 * createTenant() — new schema + seed defaults (db/seeds/tenant-defaults).
 */
export async function createTenant(_input: {
  name: string;
  subdomain: string;
}): Promise<{ tenantId: string }> {
  throw new Error("Provisioning not implemented");
}
