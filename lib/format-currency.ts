/**
 * Display amounts as EUR (UI + emails). Values in DB stay numeric.
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
