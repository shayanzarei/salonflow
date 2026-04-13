import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { loadServiceDetail } from "@/lib/services/service-detail";
import { NextRequest, NextResponse } from "next/server";

type PatchBody = {
  name?: string;
  description?: string | null;
  price?: number;
  durationMinutes?: number;
  category?: string;
  isActive?: boolean;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const detail = await loadServiceDetail(pool, tenant.id, id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await pool.query(
    `SELECT id FROM services WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );
  if (!existing.rows[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (typeof body.name === "string" && body.name.trim()) {
    updates.push(`name = $${i++}`);
    values.push(body.name.trim());
  }
  if (body.description !== undefined) {
    updates.push(`description = $${i++}`);
    values.push(body.description === null ? null : String(body.description));
  }
  if (body.price !== undefined && Number.isFinite(body.price)) {
    updates.push(`price = $${i++}`);
    values.push(body.price);
  }
  if (
    body.durationMinutes !== undefined &&
    Number.isFinite(body.durationMinutes)
  ) {
    updates.push(`duration_mins = $${i++}`);
    values.push(Math.round(body.durationMinutes));
  }
  if (typeof body.category === "string") {
    const cat = body.category.trim();
    if ((SERVICE_CATEGORIES as readonly string[]).includes(cat)) {
      updates.push(`category = $${i++}`);
      values.push(cat);
    }
  }
  if (typeof body.isActive === "boolean") {
    updates.push(`is_active = $${i++}`);
    values.push(body.isActive);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  values.push(id, tenant.id);
  await pool.query(
    `UPDATE services SET ${updates.join(", ")} WHERE id = $${i++} AND tenant_id = $${i++}`,
    values
  );

  const detail = await loadServiceDetail(pool, tenant.id, id);
  return NextResponse.json(detail);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await pool.query(
    `DELETE FROM services WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [id, tenant.id]
  );
  if (!result.rows[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
