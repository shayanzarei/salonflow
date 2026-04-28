import { authOptions } from "@/lib/auth-options";
import { findLeads, type LeadFilters } from "@/lib/google-places";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/leads/search
 *
 * Super-admin endpoint that proxies to Google Places API (New) v1 to find
 * marketing leads. Supports both Text Search and Nearby Search modes plus
 * post-filters (has-website, rating range, review-count range, operational-only).
 *
 * Body: {
 *   mode: "text" | "nearby",
 *   query?: string,                 // text mode
 *   lat?: number, lng?: number,     // nearby mode
 *   radius?: number,                // meters (max 50000)
 *   includedTypes?: string[],       // place types (Text mode honors only the first)
 *   hasWebsite?: boolean,
 *   ratingMin?: number, ratingMax?: number,
 *   reviewMin?: number, reviewMax?: number,
 *   operationalOnly?: boolean,      // default true
 *   limit?: number,
 * }
 *
 * Returns: { leads: PlaceLead[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as { isAdmin?: boolean } | null)?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      mode?: string;
      query?: string;
      lat?: number;
      lng?: number;
      radius?: number;
      includedTypes?: string[];
      hasWebsite?: boolean;
      ratingMin?: number;
      ratingMax?: number;
      reviewMin?: number;
      reviewMax?: number;
      operationalOnly?: boolean;
      limit?: number;
    };

    const mode = body.mode === "nearby" ? "nearby" : "text";

    if (mode === "text" && !body.query?.trim()) {
      return NextResponse.json(
        { error: "Text Search requires a `query`." },
        { status: 422 }
      );
    }
    if (
      mode === "nearby" &&
      (typeof body.lat !== "number" ||
        typeof body.lng !== "number" ||
        typeof body.radius !== "number")
    ) {
      return NextResponse.json(
        { error: "Nearby Search requires `lat`, `lng`, and `radius`." },
        { status: 422 }
      );
    }
    if (
      mode === "nearby" &&
      (!Array.isArray(body.includedTypes) || body.includedTypes.length === 0)
    ) {
      return NextResponse.json(
        { error: "Nearby Search requires at least one `includedType`." },
        { status: 422 }
      );
    }

    const filters: LeadFilters = {
      query: body.query,
      lat: body.lat,
      lng: body.lng,
      radius: body.radius,
      includedTypes: Array.isArray(body.includedTypes)
        ? body.includedTypes.filter((t) => typeof t === "string" && t.length > 0)
        : undefined,
      hasWebsite:
        typeof body.hasWebsite === "boolean" ? body.hasWebsite : undefined,
      ratingMin:
        typeof body.ratingMin === "number" ? body.ratingMin : undefined,
      ratingMax:
        typeof body.ratingMax === "number" ? body.ratingMax : undefined,
      reviewMin:
        typeof body.reviewMin === "number" ? body.reviewMin : undefined,
      reviewMax:
        typeof body.reviewMax === "number" ? body.reviewMax : undefined,
      operationalOnly:
        typeof body.operationalOnly === "boolean"
          ? body.operationalOnly
          : undefined,
      limit: typeof body.limit === "number" ? body.limit : undefined,
    };

    const leads = await findLeads(mode, filters);
    return NextResponse.json({ leads });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to search leads.";
    console.error("[admin leads search]", error);
    const status = /api key/i.test(message) ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
