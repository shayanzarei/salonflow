import { authOptions } from "@/lib/auth-options";
import { findLeads, type LeadFilters, type PlaceLead } from "@/lib/google-places";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/leads/export
 *
 * Same input as /api/admin/leads/search but returns a CSV attachment instead
 * of JSON. Useful for exporting prospect lists into a spreadsheet.
 */

const CSV_COLUMNS: { key: keyof PlaceLead; header: string }[] = [
  { key: "name", header: "Name" },
  { key: "primaryTypeDisplay", header: "Primary type" },
  { key: "address", header: "Address" },
  { key: "phone", header: "Phone" },
  { key: "website", header: "Website" },
  { key: "googleMapsUrl", header: "Google Maps URL" },
  { key: "rating", header: "Rating" },
  { key: "reviewCount", header: "Reviews" },
  { key: "businessStatus", header: "Status" },
  { key: "lat", header: "Lat" },
  { key: "lng", header: "Lng" },
  { key: "placeId", header: "Place ID" },
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // RFC 4180: wrap in quotes if value contains comma, quote, or newline
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function leadsToCsv(leads: PlaceLead[]): string {
  const header = CSV_COLUMNS.map((c) => escapeCsv(c.header)).join(",");
  const rows = leads.map((lead) =>
    CSV_COLUMNS.map((c) => escapeCsv(lead[c.key])).join(",")
  );
  return [header, ...rows].join("\r\n");
}

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
    const csv = leadsToCsv(leads);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace(/T/, "_")
      .replace(/Z$/, "");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${timestamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to export leads.";
    console.error("[admin leads export]", error);
    const status = /api key/i.test(message) ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
