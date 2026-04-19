import { LOCALES, type Locale } from "@/lib/i18n/translations";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/locale
 * Body: { locale: "en" | "nl" }
 *
 * Sets the NEXT_LOCALE cookie so the server-rendered layout can read
 * the user's language preference on the next request.
 */
export async function POST(req: NextRequest) {
  let locale: string;

  try {
    const body = (await req.json()) as { locale?: unknown };
    locale = String(body.locale ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!LOCALES.includes(locale as Locale)) {
    return NextResponse.json(
      { error: `Unsupported locale. Use: ${LOCALES.join(", ")}` },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false, // must be readable client-side for the switcher
  });
  return res;
}
