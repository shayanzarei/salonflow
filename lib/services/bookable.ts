/** SQL fragment: service can appear on public booking flows (alias optional, include trailing AND). */
export function bookableServiceSql(alias = ""): string {
  const p = alias ? `${alias}.` : "";
  return `COALESCE(${p}is_draft, false) = false AND COALESCE(${p}is_active, true) = true`;
}
