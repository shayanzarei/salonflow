/**
 * Google Places API (New) client — admin lead finder.
 *
 * Uses the v1 endpoints with HTTP POST + X-Goog-Api-Key header + field masks.
 * Docs: https://developers.google.com/maps/documentation/places/web-service
 *
 * Two modes are supported:
 *  - Text Search:    POST /v1/places:searchText
 *  - Nearby Search:  POST /v1/places:searchNearby
 *
 * Both endpoints return the same Place shape, so callers get a uniform
 * `PlaceLead[]` regardless of mode.
 *
 * The API key MUST be set via the GOOGLE_PLACES_API_KEY env var. This module
 * is server-only — never import it from a client component.
 */

const PLACES_BASE = "https://places.googleapis.com/v1";

// Fields requested via X-Goog-FieldMask. Adjust if you need more (price level,
// opening hours, photos, etc.). Each extra field is billed.
const PLACE_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
].join(",");

export type PlaceLead = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  primaryType: string | null;
  primaryTypeDisplay: string | null;
  types: string[];
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  businessStatus: string | null;
};

export type LeadFilters = {
  /** Free-text query for Text Search mode. e.g. "hair salons in Amsterdam" */
  query?: string;
  /** Lat/lng + radius (meters) for Nearby Search mode. */
  lat?: number;
  lng?: number;
  /** Radius in meters (max 50000 per Google). */
  radius?: number;
  /** Restrict to one or more place types, e.g. ["hair_salon", "beauty_salon"]. */
  includedTypes?: string[];
  /** Has a website (true) / does not have a website (false) / no filter (undefined). */
  hasWebsite?: boolean;
  /** Minimum Google rating, 0-5 inclusive. */
  ratingMin?: number;
  /** Maximum Google rating, 0-5 inclusive. */
  ratingMax?: number;
  /** Minimum number of reviews. */
  reviewMin?: number;
  /** Maximum number of reviews. */
  reviewMax?: number;
  /** Only "OPERATIONAL" businesses (skip closed-permanently/temp). Default true. */
  operationalOnly?: boolean;
  /** Cap the number of results we return after post-filtering. */
  limit?: number;
};

type PlacesV1Place = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
};

type PlacesV1Response = {
  places?: PlacesV1Place[];
  error?: { code?: number; message?: string; status?: string };
};

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is not configured. Add it to .env.local."
    );
  }
  return key;
}

function normalizePlace(place: PlacesV1Place): PlaceLead | null {
  if (!place.id) return null;
  return {
    placeId: place.id,
    name: place.displayName?.text ?? "(unnamed)",
    address: place.formattedAddress ?? null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    primaryType: place.primaryType ?? null,
    primaryTypeDisplay: place.primaryTypeDisplayName?.text ?? null,
    types: Array.isArray(place.types) ? place.types : [],
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    googleMapsUrl: place.googleMapsUri ?? null,
    rating: typeof place.rating === "number" ? place.rating : null,
    reviewCount:
      typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    businessStatus: place.businessStatus ?? null,
  };
}

function applyPostFilters(
  rows: PlaceLead[],
  filters: LeadFilters
): PlaceLead[] {
  const operationalOnly = filters.operationalOnly !== false;

  return rows.filter((row) => {
    if (operationalOnly && row.businessStatus && row.businessStatus !== "OPERATIONAL") {
      return false;
    }
    if (filters.hasWebsite === true && !row.website) return false;
    if (filters.hasWebsite === false && row.website) return false;
    if (
      typeof filters.ratingMin === "number" &&
      (row.rating ?? 0) < filters.ratingMin
    ) {
      return false;
    }
    if (
      typeof filters.ratingMax === "number" &&
      row.rating !== null &&
      row.rating > filters.ratingMax
    ) {
      return false;
    }
    if (
      typeof filters.reviewMin === "number" &&
      (row.reviewCount ?? 0) < filters.reviewMin
    ) {
      return false;
    }
    if (
      typeof filters.reviewMax === "number" &&
      row.reviewCount !== null &&
      row.reviewCount > filters.reviewMax
    ) {
      return false;
    }
    return true;
  });
}

async function callPlaces(
  path: "places:searchText" | "places:searchNearby",
  body: Record<string, unknown>
): Promise<PlaceLead[]> {
  const key = getApiKey();

  const res = await fetch(`${PLACES_BASE}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": PLACE_FIELDS,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json: PlacesV1Response = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      json?.error?.message ?? `Places API error (HTTP ${res.status})`;
    throw new Error(message);
  }

  const rows = (json.places ?? [])
    .map(normalizePlace)
    .filter((r): r is PlaceLead => r !== null);

  return rows;
}

/**
 * Text Search mode — pass a free-text `query` like "hair salons in Amsterdam".
 * Most flexible; Google parses location and intent from the query.
 */
export async function textSearchLeads(
  filters: LeadFilters
): Promise<PlaceLead[]> {
  if (!filters.query?.trim()) {
    throw new Error("Text Search requires a `query`.");
  }

  const body: Record<string, unknown> = {
    textQuery: filters.query.trim(),
    pageSize: 20, // max allowed in v1
  };
  if (filters.includedTypes && filters.includedTypes.length > 0) {
    // Text Search only honors a single includedType — pick the first.
    body.includedType = filters.includedTypes[0];
  }

  const rows = await callPlaces("places:searchText", body);
  const filtered = applyPostFilters(rows, filters);
  return typeof filters.limit === "number"
    ? filtered.slice(0, filters.limit)
    : filtered;
}

/**
 * Nearby Search mode — needs lat, lng, radius (meters), and at least one type.
 */
export async function nearbySearchLeads(
  filters: LeadFilters
): Promise<PlaceLead[]> {
  if (
    typeof filters.lat !== "number" ||
    typeof filters.lng !== "number" ||
    typeof filters.radius !== "number"
  ) {
    throw new Error("Nearby Search requires `lat`, `lng`, and `radius`.");
  }
  if (!filters.includedTypes || filters.includedTypes.length === 0) {
    throw new Error("Nearby Search requires at least one `includedType`.");
  }

  const body: Record<string, unknown> = {
    includedTypes: filters.includedTypes,
    maxResultCount: 20, // max allowed in v1
    locationRestriction: {
      circle: {
        center: { latitude: filters.lat, longitude: filters.lng },
        radius: Math.min(filters.radius, 50000),
      },
    },
  };

  const rows = await callPlaces("places:searchNearby", body);
  const filtered = applyPostFilters(rows, filters);
  return typeof filters.limit === "number"
    ? filtered.slice(0, filters.limit)
    : filtered;
}

/**
 * Convenience switch — pick mode based on what the caller supplied.
 */
export async function findLeads(
  mode: "text" | "nearby",
  filters: LeadFilters
): Promise<PlaceLead[]> {
  if (mode === "text") return textSearchLeads(filters);
  return nearbySearchLeads(filters);
}

/**
 * Common Google place types relevant to SoloHub's marketing prospecting.
 * (Not exhaustive — extend as needed.)
 *
 * Reference: https://developers.google.com/maps/documentation/places/web-service/place-types
 */
export const COMMON_PLACE_TYPES: { value: string; label: string }[] = [
  { value: "hair_salon", label: "Hair salon" },
  { value: "beauty_salon", label: "Beauty salon" },
  { value: "barber_shop", label: "Barber shop" },
  { value: "nail_salon", label: "Nail salon" },
  { value: "spa", label: "Spa" },
  { value: "hair_care", label: "Hair care" },
  { value: "skin_care_clinic", label: "Skin care clinic" },
  { value: "massage", label: "Massage" },
  { value: "tanning_studio", label: "Tanning studio" },
  { value: "tattoo_parlor", label: "Tattoo parlor" },
  { value: "wellness_center", label: "Wellness center" },
  { value: "yoga_studio", label: "Yoga studio" },
  { value: "gym", label: "Gym" },
  { value: "fitness_center", label: "Fitness center" },
  { value: "physiotherapist", label: "Physiotherapist" },
  { value: "dentist", label: "Dentist" },
];
