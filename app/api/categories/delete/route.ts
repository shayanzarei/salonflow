import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenant = await getTenant();
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const id = body.id as string;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Unlink services first (FK is SET NULL so just confirm ownership)
  await pool.query(
    `DELETE FROM service_categories WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );

  return NextResponse.json({ ok: true });
}
