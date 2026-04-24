import { computeSlots } from "@/lib/availability";
import { requireOwner } from "@/lib/require-owner";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date");

  if (!serviceId || !staffId || !date) {
    return NextResponse.json(
      { error: "serviceId, staffId, and date are required" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const slots = await computeSlots({
    serviceId,
    staffId,
    date,
    tenantId: tenant.id,
  });

  return NextResponse.json(
    { slots },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
