export const PLANS = {
  starter: {
    label: 'Starter',
    price: 29,
    features: [
      'online_booking',
      'email_reminders',
    ],
  },
  pro: {
    label: 'Pro',
    price: 79,
    features: [
      'online_booking',
      'email_reminders',
      'sms_reminders',
      'analytics',
      'custom_branding',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    price: 199,
    features: [
      'online_booking',
      'email_reminders',
      'sms_reminders',
      'analytics',
      'custom_branding',
      'gift_cards',
      'multi_location',
      'api_access',
    ],
  },
} as const;

export type PlanTier = keyof typeof PLANS;
export type FeatureKey = (typeof PLANS)[PlanTier]["features"][number];

/** Sync plan lookup (no DB). For UI gates when tenant overrides are not needed. */
export function planIncludesFeature(planTier: string, feature: string): boolean {
  const planFeatures = PLANS[planTier as PlanTier]?.features ?? [];
  return planFeatures.some((f) => f === feature);
}