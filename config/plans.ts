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


export const SITE_SECTIONS = [
  { key: 'section_hero', label: 'Hero', description: 'Main banner with booking CTA', required: true },
  { key: 'section_services', label: 'Services', description: 'Service list with prices', required: false },
  { key: 'section_team', label: 'Team', description: 'Staff profiles', required: false },
  { key: 'section_gallery', label: 'Gallery', description: 'Photo gallery', required: false },
  { key: 'section_reviews', label: 'Reviews', description: 'Client testimonials', required: false },
  { key: 'section_about', label: 'About', description: 'Salon story and info', required: false },
  { key: 'section_contact', label: 'Contact', description: 'Address, hours, booking CTA', required: false },
] as const;



export type PlanTier = keyof typeof PLANS;
export type FeatureKey = (typeof PLANS)[PlanTier]["features"][number];
export type SectionKey = typeof SITE_SECTIONS[number]['key'];

/** Sync plan lookup (no DB). For UI gates when tenant overrides are not needed. */
export function planIncludesFeature(planTier: string, feature: string): boolean {
  const planFeatures = PLANS[planTier as PlanTier]?.features ?? [];
  return planFeatures.some((f) => f === feature);
}