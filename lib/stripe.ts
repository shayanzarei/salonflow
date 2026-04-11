/**
 * Stripe client + helpers — init with STRIPE_SECRET_KEY when billing is enabled.
 */
export function getStripeClient(): never {
  throw new Error("Stripe not configured (lib/stripe.ts)");
}
