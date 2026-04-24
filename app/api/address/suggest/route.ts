import { NextRequest, NextResponse } from "next/server";

type PdokSuggestResponse = {
  response?: {
    docs?: Array<{
      id?: string;
      weergavenaam?: string;
    }>;
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const upstream = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?wt=json&q=${encodeURIComponent(
        query
      )}&rows=6`,
      { cache: "no-store" }
    );

    if (!upstream.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const payload = (await upstream.json()) as PdokSuggestResponse;
    const suggestions = (payload.response?.docs ?? [])
      .map((doc) => ({
        id: doc.id ?? "",
        label: doc.weergavenaam ?? "",
      }))
      .filter((item) => item.label.length > 0);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
