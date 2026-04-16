export type PackageId = "solo" | "hub" | "agency";

export type PackageBooleanKey =
  | "online_booking"
  | "unlimited_bookings"
  | "multi_staff_booking"
  | "realtime_availability"
  | "customer_cancellation"
  | "double_booking_prevention"
  | "staff_working_hours"
  | "staff_portal"
  | "service_to_staff_assignment"
  | "email_booking_confirmations"
  | "automated_reminder_emails"
  | "review_request_emails"
  | "in_app_notifications"
  | "customer_database"
  | "customer_segmentation"
  | "total_spend_history"
  | "public_booking_page"
  | "gallery"
  | "public_reviews"
  | "custom_branding"
  | "custom_domain"
  | "dashboard_metrics"
  | "revenue_analytics"
  | "advanced_reporting"
  | "email_support"
  | "priority_email_support"
  | "dedicated_account_manager"
  | "onboarding_call"
  | "sla_guarantee";

export type PackageLimitKey =
  | "max_bookings_per_month"
  | "max_staff"
  | "max_services"
  | "max_templates";

export type PackageEntitlementKey = PackageBooleanKey | PackageLimitKey;

export type PackageEntitlementType = "boolean" | "limit";

export type PackageDefinition = {
  id: PackageId;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  featured: boolean;
  sortOrder: number;
};

export type ResolvedPackage = {
  id: PackageId;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
  entitlements: Record<PackageEntitlementKey, boolean | number | null>;
};

export const DEFAULT_PACKAGE_DEFINITIONS: readonly PackageDefinition[] = [
  {
    id: "solo",
    name: "Solo",
    subtitle: "Perfect for solo business & freelancers.",
    monthlyPrice: 17,
    annualPrice: 156,
    featured: false,
    sortOrder: 1,
  },
  {
    id: "hub",
    name: "Hub",
    subtitle: "For small businesses with 2-5 staff members.",
    monthlyPrice: 37,
    annualPrice: 348,
    featured: true,
    sortOrder: 2,
  },
  {
    id: "agency",
    name: "Agency",
    subtitle: "For growing businesses with +5 staff members.",
    monthlyPrice: 67,
    annualPrice: 636,
    featured: false,
    sortOrder: 3,
  },
] as const;

type EntitlementDefinitionBase = {
  key: PackageEntitlementKey;
  label: string;
  description: string;
  category: string;
};

type BooleanEntitlementDefinition = EntitlementDefinitionBase & {
  type: "boolean";
  defaultValues: Record<PackageId, boolean>;
  cardLabel?: string;
};

type LimitEntitlementDefinition = EntitlementDefinitionBase & {
  type: "limit";
  defaultValues: Record<PackageId, number | null>;
  cardFormatter?: (value: number | null) => string;
  comparisonFormatter?: (value: number | null) => string;
};

export type EntitlementDefinition =
  | BooleanEntitlementDefinition
  | LimitEntitlementDefinition;

export const PACKAGE_ENTITLEMENTS: readonly EntitlementDefinition[] = [
  {
    key: "online_booking",
    type: "boolean",
    label: "Online booking widget",
    description: "Clients can book services from the public booking page.",
    category: "Booking & appointments",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "unlimited_bookings",
    type: "boolean",
    label: "Unlimited bookings/month",
    description: "Remove monthly booking caps.",
    category: "Booking & appointments",
    defaultValues: { solo: false, hub: true, agency: true },
    cardLabel: "Unlimited Bookings",
  },
  {
    key: "max_bookings_per_month",
    type: "limit",
    label: "Bookings per month",
    description: "Monthly booking cap for this package. Leave empty for unlimited.",
    category: "Booking & appointments",
    defaultValues: { solo: 100, hub: null, agency: null },
    cardFormatter: (value) =>
      value === null ? "Unlimited Bookings" : `${value} Bookings/mo`,
    comparisonFormatter: (value) =>
      value === null ? "Unlimited" : `up to ${value}`,
  },
  {
    key: "multi_staff_booking",
    type: "boolean",
    label: "Multi-staff booking",
    description: "Allow booking flows across multiple staff members.",
    category: "Booking & appointments",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "realtime_availability",
    type: "boolean",
    label: "Real-time availability engine",
    description: "Show live bookable availability.",
    category: "Booking & appointments",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "customer_cancellation",
    type: "boolean",
    label: "Customer cancellation (email link)",
    description: "Allow customers to cancel using email links.",
    category: "Booking & appointments",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "double_booking_prevention",
    type: "boolean",
    label: "Double-booking prevention",
    description: "Prevent overlapping bookings for the same staff member.",
    category: "Booking & appointments",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "max_staff",
    type: "limit",
    label: "Staff profiles",
    description: "Maximum active staff members. Leave empty for unlimited.",
    category: "Staff & services",
    defaultValues: { solo: 1, hub: 5, agency: 15 },
    cardFormatter: (value) => {
      if (value === null) return "Unlimited staff members";
      if (value === 1) return "1 Staff Profile";
      return `Up to ${value} Staff Members`;
    },
    comparisonFormatter: (value) => {
      if (value === null) return "Unlimited";
      if (value === 1) return "1 staff";
      return `up to ${value}`;
    },
  },
  {
    key: "max_services",
    type: "limit",
    label: "Services & categories",
    description: "Maximum number of services/categories. Leave empty for unlimited.",
    category: "Staff & services",
    defaultValues: { solo: 15, hub: 50, agency: null },
    comparisonFormatter: (value) => (value === null ? "Unlimited" : `up to ${value}`),
  },
  {
    key: "staff_working_hours",
    type: "boolean",
    label: "Staff working hours config",
    description: "Allow configuring working hours per staff member.",
    category: "Staff & services",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "staff_portal",
    type: "boolean",
    label: "Staff portal (staff login)",
    description: "Dedicated staff login and self-service portal.",
    category: "Staff & services",
    defaultValues: { solo: false, hub: true, agency: true },
    cardLabel: "Full Staff Portals",
  },
  {
    key: "service_to_staff_assignment",
    type: "boolean",
    label: "Service-to-staff assignment",
    description: "Assign specific services to specific staff members.",
    category: "Staff & services",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "email_booking_confirmations",
    type: "boolean",
    label: "Email booking confirmations",
    description: "Booking confirmation emails for clients.",
    category: "Communications & automation",
    defaultValues: { solo: true, hub: true, agency: true },
    cardLabel: "Booking Confirmations",
  },
  {
    key: "automated_reminder_emails",
    type: "boolean",
    label: "Automated reminder emails (48h, 24h, 2h)",
    description: "Automated pre-appointment reminder emails.",
    category: "Communications & automation",
    defaultValues: { solo: false, hub: true, agency: true },
    cardLabel: "Automated Email Reminders",
  },
  {
    key: "review_request_emails",
    type: "boolean",
    label: "Review request emails",
    description: "Send post-visit review request emails.",
    category: "Communications & automation",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "in_app_notifications",
    type: "boolean",
    label: "In-app notifications",
    description: "Notifications inside the dashboard and staff portal.",
    category: "Communications & automation",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "customer_database",
    type: "boolean",
    label: "Customer database",
    description: "Store client records and booking history.",
    category: "Customer management",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "customer_segmentation",
    type: "boolean",
    label: "Customer segmentation (VIP, At Risk etc.)",
    description: "Advanced customer segmentation and cohorting.",
    category: "Customer management",
    defaultValues: { solo: false, hub: false, agency: true },
    cardLabel: "Advanced Customer Data",
  },
  {
    key: "total_spend_history",
    type: "boolean",
    label: "Total spend & booking history per client",
    description: "View total customer spend and historical bookings.",
    category: "Customer management",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "public_booking_page",
    type: "boolean",
    label: "Public booking page (subdomain)",
    description: "Hosted public booking page on a SoloHub subdomain.",
    category: "Website & branding",
    defaultValues: { solo: true, hub: true, agency: true },
    cardLabel: "Professional Booking Page",
  },
  {
    key: "max_templates",
    type: "limit",
    label: "Website builder templates",
    description: "How many public website templates are available.",
    category: "Website & branding",
    defaultValues: { solo: 1, hub: 6, agency: 6 },
    cardFormatter: (value) =>
      value === 1 ? "Website builder (1 template)" : `Website Builder (${value} templates)`,
    comparisonFormatter: (value) =>
      value === 1 ? "1 template" : value === null ? "Unlimited" : `${value} templates`,
  },
  {
    key: "gallery",
    type: "boolean",
    label: "Gallery (before/after photos)",
    description: "Gallery section on the public website.",
    category: "Website & branding",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "public_reviews",
    type: "boolean",
    label: "Public reviews display",
    description: "Show public client reviews on the website.",
    category: "Website & branding",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "custom_branding",
    type: "boolean",
    label: "Custom branding (logo, colors)",
    description: "Use custom logo, brand colors, and brand assets.",
    category: "Website & branding",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "custom_domain",
    type: "boolean",
    label: "Custom domain",
    description: "Connect and use a custom website domain.",
    category: "Website & branding",
    defaultValues: { solo: false, hub: false, agency: true },
    cardLabel: "Custom Domain Support",
  },
  {
    key: "dashboard_metrics",
    type: "boolean",
    label: "Dashboard overview metrics",
    description: "Basic dashboard metrics and operational summaries.",
    category: "Analytics & reporting",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "revenue_analytics",
    type: "boolean",
    label: "Revenue & customer analytics",
    description: "Revenue trends and customer analytics.",
    category: "Analytics & reporting",
    defaultValues: { solo: false, hub: true, agency: true },
  },
  {
    key: "advanced_reporting",
    type: "boolean",
    label: "Advanced reporting",
    description: "Advanced reporting dashboards and exports.",
    category: "Analytics & reporting",
    defaultValues: { solo: false, hub: false, agency: true },
  },
  {
    key: "email_support",
    type: "boolean",
    label: "Email support",
    description: "Standard support via email.",
    category: "Support",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "priority_email_support",
    type: "boolean",
    label: "Priority email support",
    description: "Priority handling of support requests.",
    category: "Support",
    defaultValues: { solo: false, hub: false, agency: true },
    cardLabel: "Priority Email Support",
  },
  {
    key: "dedicated_account_manager",
    type: "boolean",
    label: "Dedicated account manager",
    description: "Dedicated customer success/account manager.",
    category: "Support",
    defaultValues: { solo: false, hub: false, agency: false },
  },
  {
    key: "onboarding_call",
    type: "boolean",
    label: "Onboarding call",
    description: "Founders onboarding call included.",
    category: "Support",
    defaultValues: { solo: true, hub: true, agency: true },
  },
  {
    key: "sla_guarantee",
    type: "boolean",
    label: "SLA guarantee",
    description: "Formal uptime/response SLA.",
    category: "Support",
    defaultValues: { solo: false, hub: false, agency: false },
  },
] as const;

export const FEATURED_CARD_KEYS: readonly PackageEntitlementKey[] = [
  "max_staff",
  "max_bookings_per_month",
  "public_booking_page",
  "max_templates",
  "email_booking_confirmations",
  "staff_portal",
  "automated_reminder_emails",
  "customer_segmentation",
  "custom_domain",
  "priority_email_support",
] as const;

export const PACKAGE_COMPARISON_CATEGORIES = Array.from(
  new Set(PACKAGE_ENTITLEMENTS.map((item) => item.category))
);

export function getEntitlementDefinition(key: PackageEntitlementKey) {
  return PACKAGE_ENTITLEMENTS.find((item) => item.key === key);
}

export function getPackageCardBullets(pkg: ResolvedPackage) {
  const bullets: string[] = [];

  for (const key of FEATURED_CARD_KEYS) {
    const def = getEntitlementDefinition(key);
    if (!def) continue;
    const value = pkg.entitlements[key];

    if (def.type === "boolean" && value === true && def.cardLabel) {
      bullets.push(def.cardLabel);
    }

    if (def.type === "limit" && def.cardFormatter) {
      bullets.push(def.cardFormatter((value as number | null) ?? null));
    }
  }

  return Array.from(new Set(bullets)).slice(0, 5);
}

export function getPackageComparisonRows(packages: ResolvedPackage[]) {
  return PACKAGE_COMPARISON_CATEGORIES.map((category) => ({
    category,
    rows: PACKAGE_ENTITLEMENTS.filter((item) => item.category === category).map((item) => ({
      key: item.key,
      label: item.label,
      values: Object.fromEntries(
        packages.map((pkg) => {
          const value = pkg.entitlements[item.key];
          if (item.type === "boolean") {
            return [pkg.id, Boolean(value)];
          }
          return [
            pkg.id,
            item.comparisonFormatter
              ? item.comparisonFormatter((value as number | null) ?? null)
              : value,
          ];
        })
      ) as Record<PackageId, boolean | string | number | null>,
    })),
  }));
}
