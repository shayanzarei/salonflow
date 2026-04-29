/**
 * lib/seo/json-ld.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the schema.org JSON-LD blob we inject server-side on every public
 * tenant landing page.
 *
 * Why this matters
 * ----------------
 * `LocalBusiness` (and its `HairSalon` / `BeautySalon` subtypes) is what
 * triggers Google's rich result for local listings — the cards with hours,
 * phone, address, and star rating that show up above the regular blue links
 * for "salon near me" searches. No JSON-LD = no rich result, full stop.
 * It's the single highest-leverage SEO addition for a local-services product.
 *
 * Design rules
 * ------------
 *   • Only emit fields we actually have. A blank "address" or 0-review
 *     `aggregateRating` is worse than absent — Google flags inconsistent
 *     data and it hurts ranking.
 *   • The output is plain JSON; the page wraps it in
 *     <script type="application/ld+json">{...}</script>. Stringification
 *     handles escaping; no innerHTML quirks.
 *   • IRI consistency: `@id` and `url` use the same canonical
 *     https://{slug}.solohub.nl form. If a tenant moves to a custom domain
 *     later, this becomes the canonical-domain helper's responsibility.
 *
 * Subtype choice
 * --------------
 * We always emit `LocalBusiness` because we don't yet store a tenant
 * "vertical" field. Once we do (hair / nails / massage / etc.), promote to
 * `HairSalon`, `NailSalon`, `BeautySalon`, `DaySpa` for finer-grained
 * matching — these are real schema.org types Google understands.
 */

import type { Tenant } from "@/types/tenant";

export interface JsonLdServiceLike {
  name: string;
  price?: number | string | null;
  duration_mins?: number | null;
}

export interface JsonLdReviewStats {
  total: number;
  avg_rating: number;
}

export interface JsonLdWorkingHour {
  /** 0=Sun, 1=Mon, …, 6=Sat — same convention as JS Date.getDay(). */
  day_of_week: number;
  /** "HH:MM" or "HH:MM:SS" — Postgres TIME serialisation. */
  start_time: string;
  end_time: string;
  is_working: boolean;
}

/**
 * Map JS-style 0..6 (Sun..Sat) to schema.org's day enum. schema.org expects
 * the exact strings "Monday", "Tuesday", … — case matters.
 */
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export interface BuildLocalBusinessJsonLdInput {
  tenant: Tenant;
  /** Canonical https URL of the public landing page. Used for both `@id` and `url`. */
  pageUrl: string;
  services: JsonLdServiceLike[];
  reviewStats: JsonLdReviewStats | null;
  workingHours: JsonLdWorkingHour[];
}

/**
 * Build the schema.org blob. Returns a plain JSON-serialisable object.
 *
 * Caller responsibility: stringify and inject as
 *   <script type="application/ld+json">{JSON.stringify(blob)}</script>
 * inside the rendered page (server-side, NOT in a Client Component — Google's
 * crawler reads the initial HTML).
 */
export function buildLocalBusinessJsonLd(
  input: BuildLocalBusinessJsonLdInput
): Record<string, unknown> {
  const { tenant, pageUrl, services, reviewStats, workingHours } = input;

  const blob: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": pageUrl,
    name: tenant.name,
    url: pageUrl,
  };

  // Description: tagline first (it's a one-liner, perfect for `description`),
  // then `about` if no tagline. Skip if both are empty — half-empty
  // structured data is worse than no structured data.
  const description = tenant.tagline?.trim() || tenant.about?.trim();
  if (description) blob.description = description;

  // Image: hero is the most representative; logo is the "brand mark".
  // schema.org allows both — `image` for the hero shot and `logo` for the
  // identity asset. Google uses `image` in the rich result when present.
  if (tenant.hero_image_url) blob.image = tenant.hero_image_url;
  if (tenant.logo_url) blob.logo = tenant.logo_url;

  if (tenant.phone?.trim()) blob.telephone = tenant.phone.trim();

  // Address: free-text. We don't have structured `streetAddress` /
  // `addressLocality` columns yet, so emit `PostalAddress` with the whole
  // string in `streetAddress`. Google still parses this correctly for
  // local results — it just doesn't get the breakdown bonus.
  if (tenant.address?.trim()) {
    blob.address = {
      "@type": "PostalAddress",
      streetAddress: tenant.address.trim(),
    };
  }

  // Hours: emit one `OpeningHoursSpecification` per working day. Skip
  // closed days entirely — `is_working: false` rows have nonsense
  // start/end times that we don't want surfaced.
  const openingHours = workingHours
    .filter((wh) => wh.is_working)
    .map((wh) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[wh.day_of_week] ?? null,
      opens: normaliseTime(wh.start_time),
      closes: normaliseTime(wh.end_time),
    }))
    .filter((spec) => spec.dayOfWeek !== null);

  if (openingHours.length > 0) {
    blob.openingHoursSpecification = openingHours;
  }

  // Aggregate rating: only emit when we have at least 1 review. Google
  // ignores (and may flag) `ratingValue` with `reviewCount: 0`.
  if (reviewStats && reviewStats.total > 0) {
    blob.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewStats.avg_rating,
      reviewCount: reviewStats.total,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Services as an `OfferCatalog` of `Offer`s. This drives the
  // "Services offered" stripe in some rich result variants. We cap at 10
  // to keep the blob small — anything more isn't shown anyway.
  if (services.length > 0) {
    blob.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `Services offered by ${tenant.name}`,
      itemListElement: services.slice(0, 10).map((s) => {
        const offer: Record<string, unknown> = {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
          },
        };
        if (s.price != null && s.price !== "") {
          offer.price = String(s.price);
          offer.priceCurrency = "EUR";
        }
        return offer;
      }),
    };
  }

  // Social profiles: schema.org's `sameAs` is the canonical place. Google
  // uses these for entity resolution ("yes, this is the same business as
  // the Instagram account").
  const sameAs = [
    tenant.social_instagram,
    tenant.social_facebook,
    tenant.social_tiktok,
    tenant.social_youtube,
  ]
    .map((u) => u?.trim())
    .filter((u): u is string => Boolean(u && /^https?:\/\//i.test(u)));

  if (sameAs.length > 0) blob.sameAs = sameAs;

  return blob;
}

/**
 * Postgres TIME serialises as "HH:MM:SS"; schema.org wants "HH:MM" (the
 * seconds field is ignored anyway). Trim it so the JSON-LD is leaner.
 */
function normaliseTime(t: string): string {
  if (!t) return t;
  const m = /^(\d{2}:\d{2})/.exec(t);
  return m ? m[1] : t;
}
