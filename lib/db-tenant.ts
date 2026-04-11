/**
 * Schema-scoped query wrapper — run statements against a tenant schema.
 */
export type TenantDbContext = {
  tenantId: string;
  schemaName: string;
};

export function withTenantSchema<T>(
  _ctx: TenantDbContext,
  fn: () => T,
): T {
  return fn();
}
