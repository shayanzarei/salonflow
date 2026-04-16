import { DEFAULT_PACKAGE_DEFINITIONS, PACKAGE_ENTITLEMENTS } from "@/config/packages";

const booleanFeatures = PACKAGE_ENTITLEMENTS.filter((item) => item.type === "boolean");

export const PLANS = Object.fromEntries(
  DEFAULT_PACKAGE_DEFINITIONS.map((pkg) => [
    pkg.id,
    {
      label: pkg.name,
      price: pkg.monthlyPrice,
      features: booleanFeatures
        .filter((item) => item.defaultValues[pkg.id] === true)
        .map((item) => item.key),
    },
  ])
) as Record<
  "solo" | "hub" | "agency",
  { label: string; price: number; features: string[] }
>;


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
export type FeatureKey = string;
export type SectionKey = typeof SITE_SECTIONS[number]['key'];

/** Sync plan lookup (no DB). For UI gates when tenant overrides are not needed. */
export function planIncludesFeature(planTier: string, feature: string): boolean {
  const planFeatures = PLANS[planTier as PlanTier]?.features ?? [];
  return planFeatures.some((f) => f === feature);
}