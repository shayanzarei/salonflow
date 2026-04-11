import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 415 });
  }
  return NextResponse.json({ received: true });
}
