import { computeSlots } from "@/lib/availability";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!serviceId || !staffId || !date) {
    return NextResponse.json(
      { error: "serviceId, staffId, and date are required" },
      { status: 400 }
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const slots = await computeSlots({
    serviceId,
    staffId,
    date,
    tenantId: tenant.id,
  });

  return NextResponse.json({ slots });
}
