import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenant = await getTenant();
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows } = await pool.query(
    `SELECT * FROM gallery_items WHERE tenant_id = $1 ORDER BY sort_order, created_at`,
    [tenant.id]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenant = await getTenant();
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const before_url = (body.before_url as string)?.trim();
  const after_url  = (body.after_url  as string)?.trim();
  const caption    = (body.caption    as string)?.trim() || null;

  if (!before_url || !after_url) {
    return NextResponse.json({ error: "before_url and after_url are required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO gallery_items (tenant_id, before_url, after_url, caption)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tenant.id, before_url, after_url, caption]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
