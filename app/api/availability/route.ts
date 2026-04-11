import { NextResponse } from "next/server";

/** Slot calculation — implement with lib/availability. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json(
      { error: "serviceId required" },
      { status: 400 },
    );
  }
  return NextResponse.json({ slots: [] });
}
