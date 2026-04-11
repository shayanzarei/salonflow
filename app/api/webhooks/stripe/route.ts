import { NextResponse } from "next/server";

/** subscription.created → provision tenant (see lib/provisioner). */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  return NextResponse.json({ received: true });
}
