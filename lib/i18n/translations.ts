import { authEn, authNl, type AuthSection } from "./catalog/auth";
import {
  authFlowEn,
  authFlowNl,
  type AuthFlowSection,
} from "./catalog/auth-flow";
import { bookingEn, bookingNl, type BookingSection } from "./catalog/booking";
import {
  dashboardEn,
  dashboardNl,
  type DashboardSection,
} from "./catalog/dashboard";
import { errorsEn, errorsNl, type ErrorsSection } from "./catalog/errors";
import {
  marketingEn,
  marketingNl,
  type MarketingSection,
} from "./catalog/marketing";
import { websiteEn, websiteNl, type WebsiteSection } from "./catalog/website";

// ── Supported locales ──────────────────────────────────────────────────────────

export type Locale = "en" | "nl";

export const LOCALES: Locale[] = ["en", "nl"];
export const DEFAULT_LOCALE: Locale = "en";

// ── Translation dictionary shape (all values are plain strings for each locale)

export type Messages = {
  nav: {
    home: string;
    pricing: string;
    demo: string;
    about: string;
    contact: string;
    faq: string;
    privacy: string;
    getStarted: string;
  };
  sidebar: {
    menu: string;
    settings: string;
    overview: string;
    bookings: string;
    calendar: string;
    customers: string;
    staff: string;
    services: string;
    gallery: string;
    reports: string;
    profile: string;
    openingHours: string;
    socialMedia: string;
    accountSecurity: string;
    planBilling: string;
    helpSupport: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    confirm: string;
    close: string;
    yes: string;
    no: string;
    back: string;
    next: string;
    logout: string;
  };
  locale: {
    en: string;
    nl: string;
    switchTo: string;
  };
  admin: {
    overview: string;
    tenants: string;
    packages: string;
    demoBookings: string;
    contacts: string;
    payments: string;
    settings: string;
    superAdmin: string;
  };
  footer: {
    tagline: string;
    product: string;
    resources: string;
    company: string;
    pricing: string;
    demo: string;
    blog: string;
    faqs: string;
    about: string;
    contact: string;
    privacyTerms: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
  };
  website: WebsiteSection;
  marketing: MarketingSection;
  errors: ErrorsSection;
  auth: AuthSection;
  authFlow: AuthFlowSection;
  booking: BookingSection;
  dashboard: DashboardSection;
};

export type Translations = Messages;

const en: Messages = {
  nav: {
    home: "Home",
    pricing: "Pricing",
    demo: "Book a Demo",
    about: "About Us",
    contact: "Contact",
    faq: "FAQ",
    privacy: "Privacy & Terms",
    getStarted: "Get Started",
  },
  sidebar: {
    menu: "Menu",
    settings: "Settings",
    overview: "Overview",
    bookings: "Bookings",
    calendar: "Calendar",
    customers: "Customers",
    staff: "Staff",
    services: "Services",
    gallery: "Gallery",
    reports: "Reports",
    profile: "Profile",
    openingHours: "Opening hours",
    socialMedia: "Social media",
    accountSecurity: "Account & security",
    planBilling: "Plan & billing",
    helpSupport: "Help & Support",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    loading: "Loading…",
    error: "Something went wrong.",
    confirm: "Confirm",
    close: "Close",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    logout: "Log out",
  },
  locale: {
    en: "EN",
    nl: "NL",
    switchTo: "Switch language",
  },
  admin: {
    overview: "Overview",
    tenants: "Tenants",
    packages: "Packages",
    demoBookings: "Demo bookings",
    contacts: "Contacts",
    payments: "Payments",
    settings: "Settings",
    superAdmin: "Super Admin",
  },
  footer: {
    tagline: "The operating system for independent professionals.",
    product: "Product",
    resources: "Resources",
    company: "Company",
    pricing: "Pricing",
    demo: "Book a Demo",
    blog: "Blog",
    faqs: "FAQs",
    about: "About Us",
    contact: "Contact",
    privacyTerms: "Privacy & Terms",
    copyright: "© 2024 SoloHub Inc. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
  },
  website: websiteEn,
  marketing: marketingEn,
  errors: errorsEn,
  auth: authEn,
  authFlow: authFlowEn,
  booking: bookingEn,
  dashboard: dashboardEn,
};

const nl: Messages = {
  nav: {
    home: "Home",
    pricing: "Prijzen",
    demo: "Demo boeken",
    about: "Over ons",
    contact: "Contact",
    faq: "Veelgestelde vragen",
    privacy: "Privacy & Voorwaarden",
    getStarted: "Aan de slag",
  },
  sidebar: {
    menu: "Menu",
    settings: "Instellingen",
    overview: "Overzicht",
    bookings: "Afspraken",
    calendar: "Agenda",
    customers: "Klanten",
    staff: "Medewerkers",
    services: "Diensten",
    gallery: "Galerij",
    reports: "Rapporten",
    profile: "Profiel",
    openingHours: "Openingstijden",
    socialMedia: "Sociale media",
    accountSecurity: "Account & beveiliging",
    planBilling: "Abonnement & facturatie",
    helpSupport: "Help & ondersteuning",
  },
  common: {
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
    edit: "Bewerken",
    add: "Toevoegen",
    search: "Zoeken",
    loading: "Laden…",
    error: "Er is iets misgegaan.",
    confirm: "Bevestigen",
    close: "Sluiten",
    yes: "Ja",
    no: "Nee",
    back: "Terug",
    next: "Volgende",
    logout: "Uitloggen",
  },
  locale: {
    en: "EN",
    nl: "NL",
    switchTo: "Taal wisselen",
  },
  admin: {
    overview: "Overzicht",
    tenants: "Salons",
    packages: "Pakketten",
    demoBookings: "Demo-afspraken",
    contacts: "Contacten",
    payments: "Betalingen",
    settings: "Instellingen",
    superAdmin: "Superbeheer",
  },
  footer: {
    tagline: "Het besturingssysteem voor zelfstandige professionals.",
    product: "Product",
    resources: "Bronnen",
    company: "Bedrijf",
    pricing: "Prijzen",
    demo: "Demo boeken",
    blog: "Blog",
    faqs: "FAQ",
    about: "Over ons",
    contact: "Contact",
    privacyTerms: "Privacy & Voorwaarden",
    copyright: "© 2024 SoloHub B.V. Alle rechten voorbehouden.",
    privacyPolicy: "Privacybeleid",
    termsOfService: "Servicevoorwaarden",
  },
  website: websiteNl,
  marketing: marketingNl,
  errors: errorsNl,
  auth: authNl,
  authFlow: authFlowNl,
  booking: bookingNl,
  dashboard: dashboardNl,
};

export const messages: Record<Locale, Messages> = { en, nl };
