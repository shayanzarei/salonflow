import { NextResponse } from "next/server";

/** Wire NextAuth here when dependencies are added. */
export function GET() {
  return NextResponse.json(
    { error: "Auth route not configured" },
    { status: 501 },
  );
}

export function POST() {
  return NextResponse.json(
    { error: "Auth route not configured" },
    { status: 501 },
  );
}
