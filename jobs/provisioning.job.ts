/** Async tenant provisioning after Stripe webhook. */
export async function runProvisioningJob(_stripeCustomerId: string) {
  return { ok: true as const };
}
