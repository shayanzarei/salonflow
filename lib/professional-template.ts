import type { Locale } from "@/lib/i18n/translations";

/**
 * Content model for the "Professional" website template.
 *
 * The whole tree is persisted as a single JSONB column
 * (`tenants.professional_content`, migration 020). Every visitor-facing
 * string is a {@link LocalizedText} so the NL/EN switcher swaps the salon's
 * actual copy, not just UI chrome. Language-neutral fields (address, phone,
 * social links) are NOT modelled here — the template reads the existing
 * `tenants` columns for those.
 *
 * Stored JSON is deep-merged over {@link DEFAULT_PROFESSIONAL_CONTENT} by
 * {@link mergeProfessionalContent}, so a NULL column or a partial document
 * both render sensibly (missing keys fall back to the defaults per-field).
 */

export type LocalizedText = { nl: string; en: string };

export interface ProfessionalFeatureItem {
  /** Uploaded icon image URL; "" renders the built-in decorative mark. */
  iconUrl: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface ProfessionalLegalLink {
  label: LocalizedText;
  href: string;
}

export interface ProfessionalCertification {
  /** Uploaded badge/logo image URL. */
  imageUrl: string;
  /** Alt text (language-neutral; usually the body name, e.g. "ANBOS"). */
  alt: string;
}

export interface ProfessionalContent {
  /** Thin top bar above the header. Address/primary phone come from the
   *  tenant record; these are the extras the design shows. "" hides each. */
  contactBar: {
    phone2: string;
    email: string;
  };
  /** Header navigation labels. Anchors/hrefs are fixed in the template. */
  nav: {
    treatments: LocalizedText;
    about: LocalizedText;
    book: LocalizedText;
    pricing: LocalizedText;
    contact: LocalizedText;
  };
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    ctaLabel: LocalizedText;
  };
  about: {
    /** Newlines separate paragraphs. */
    body: LocalizedText;
  };
  /** "Wat ons uniek maakt" — three feature columns. */
  unique: {
    heading: LocalizedText;
    items: ProfessionalFeatureItem[];
  };
  /** "Onze behandelingen" — cards rendered from the salon's Services. */
  treatments: {
    heading: LocalizedText;
  };
  testimonial: {
    quote: LocalizedText;
    /** Optional attribution; "" hides it. */
    author: LocalizedText;
    /** Uploaded background pattern/photo; "" falls back to a tinted band. */
    backgroundImageUrl: string;
  };
  /** Photo carousel ("Visagie"); images come from the salon's Gallery. */
  gallery: {
    heading: LocalizedText;
    ctaLabel: LocalizedText;
  };
  newsletter: {
    heading: LocalizedText;
    placeholder: LocalizedText;
    buttonLabel: LocalizedText;
    successMessage: LocalizedText;
    /** Uploaded background pattern; "" falls back to a tinted band. */
    backgroundImageUrl: string;
  };
  footer: {
    /** Small line under the footer logo, e.g. "FACE | HAIR | BODY | SKIN". */
    tagline: LocalizedText;
    menuTitle: LocalizedText;
    contactTitle: LocalizedText;
    serviceTitle: LocalizedText;
    affiliationsTitle: LocalizedText;
    legalLinks: ProfessionalLegalLink[];
    certifications: ProfessionalCertification[];
    /** Optional credit line in the bottom bar; "" hides it. */
    credit: LocalizedText;
  };
}

/** Resolve a {@link LocalizedText} for a locale, falling back to the other
 *  language (then empty) when one side is blank. */
export function localized(value: LocalizedText | undefined, locale: Locale): string {
  if (!value) return "";
  const primary = locale === "nl" ? value.nl : value.en;
  const secondary = locale === "nl" ? value.en : value.nl;
  return (primary?.trim() ? primary : secondary ?? "") ?? "";
}

export const DEFAULT_PROFESSIONAL_CONTENT: ProfessionalContent = {
  contactBar: {
    phone2: "",
    email: "",
  },
  nav: {
    treatments: { nl: "Behandelingen", en: "Treatments" },
    about: { nl: "Over ons", en: "About us" },
    book: { nl: "Afspraak maken", en: "Book now" },
    pricing: { nl: "Prijslijst", en: "Pricing" },
    contact: { nl: "Contact", en: "Contact" },
  },
  hero: {
    eyebrow: { nl: "FACE | HAIR | BODY | SKIN", en: "FACE | HAIR | BODY | SKIN" },
    title: { nl: "Beauty kliniek", en: "Your beauty clinic" },
    ctaLabel: { nl: "Afspraak maken", en: "Book an appointment" },
  },
  about: {
    body: {
      nl: "Welkom bij onze beauty salon, waar schoonheid perfectie ontmoet! Wij geloven dat iedereen het verdient om er mooi uit te zien en zich fantastisch te voelen. Daarom streven we naar het bieden van hoogwaardige behandelingen aan onze klanten.\n\nOns team van ervaren professionals is gepassioneerd over wat ze doen en trots op de uitzonderlijke resultaten die ze behalen, waardoor onze klanten zich prachtig en vol zelfvertrouwen voelen.",
      en: "Welcome to our beauty salon, where beauty meets perfection! We believe everyone deserves to look beautiful and feel fantastic. That is why we strive to offer high-quality treatments to our clients.\n\nOur team of experienced professionals is passionate about what they do and proud of the exceptional results they achieve, leaving our clients feeling beautiful and confident.",
    },
  },
  unique: {
    heading: { nl: "Wat ons uniek maakt", en: "What makes us unique" },
    items: [
      {
        iconUrl: "",
        title: { nl: "Ervaren professionals", en: "Experienced professionals" },
        body: {
          nl: "Onze specialisten behoren tot de meest ervaren professionals in de branche. U kunt erop vertrouwen dat u kwalitatieve diensten en prachtige resultaten krijgt.",
          en: "Our specialists are among the most experienced professionals in the industry. You can count on quality treatments and beautiful results.",
        },
      },
      {
        iconUrl: "",
        title: { nl: "Persoonlijke aandacht", en: "Personal attention" },
        body: {
          nl: "Bij ons staat persoonlijke aandacht centraal. Wij luisteren naar uw wensen en geven u een behandeling op maat zodat u straalt en uw verwachtingen overtreft.",
          en: "Personal attention is at our core. We listen to your needs and tailor each treatment so you leave glowing and beyond your expectations.",
        },
      },
      {
        iconUrl: "",
        title: { nl: "Innovatieve technologie", en: "Innovative technology" },
        body: {
          nl: "Wij zijn altijd toegewijd aan innovatie en gebruiken geavanceerde technologieën en producten om u de beste resultaten te geven.",
          en: "We are committed to innovation and use advanced technology and products to give you the very best results.",
        },
      },
    ],
  },
  treatments: {
    heading: { nl: "Onze behandelingen", en: "Our treatments" },
  },
  testimonial: {
    quote: {
      nl: "“De beste specialist van heel Europa! Ze heeft mij gered op mijn trouwdag. Ik ga binnenkort bij haar langs met een heel mooi cadeau!”",
      en: "“The best specialist in all of Europe! She saved me on my wedding day. I'll be stopping by soon with a lovely gift!”",
    },
    author: { nl: "", en: "" },
    backgroundImageUrl: "",
  },
  gallery: {
    heading: { nl: "Onze creaties", en: "Our work" },
    ctaLabel: { nl: "Prijslijst", en: "Pricing" },
  },
  newsletter: {
    heading: {
      nl: "Schrijf je in voor onze nieuwsbrief",
      en: "Sign up for our newsletter",
    },
    placeholder: { nl: "E-mailadres", en: "Email address" },
    buttonLabel: { nl: "Inschrijven", en: "Subscribe" },
    successMessage: {
      nl: "Bedankt! Je bent ingeschreven.",
      en: "Thank you! You're subscribed.",
    },
    backgroundImageUrl: "",
  },
  footer: {
    tagline: { nl: "FACE | HAIR | BODY | SKIN", en: "FACE | HAIR | BODY | SKIN" },
    menuTitle: { nl: "Menu", en: "Menu" },
    contactTitle: { nl: "Contact", en: "Contact" },
    serviceTitle: { nl: "Klantenservice", en: "Customer service" },
    affiliationsTitle: { nl: "Aangesloten bij", en: "Affiliated with" },
    legalLinks: [
      { label: { nl: "Algemene voorwaarden", en: "Terms & conditions" }, href: "#" },
      { label: { nl: "Privacy Policy", en: "Privacy Policy" }, href: "/privacy" },
      { label: { nl: "Cookieverklaring", en: "Cookie statement" }, href: "#" },
    ],
    certifications: [],
    credit: { nl: "", en: "" },
  },
};

// ── Deep-merge stored JSON over the defaults ─────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Merge `override` onto `base`:
 *  - plain objects merge key-by-key (only keys present on `base` survive, so
 *    stale/unknown keys in stored JSON are dropped),
 *  - arrays are replaced wholesale when the override supplies one (lets the
 *    admin add/remove feature columns, legal links, certifications),
 *  - primitives take the override when it's defined, else keep the base.
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      out[key] = deepMerge(
        (base as Record<string, unknown>)[key],
        override[key]
      );
    }
    return out as T;
  }
  return override as T;
}

/** Resolve the effective content for a tenant: stored JSON over defaults. */
export function mergeProfessionalContent(raw: unknown): ProfessionalContent {
  return deepMerge(DEFAULT_PROFESSIONAL_CONTENT, raw);
}
