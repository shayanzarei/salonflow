import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const duration_mins = formData.get("duration_mins") as string;
    const categoryId = (formData.get("category_id") as string)?.trim() || null;
    const imageUrl = (formData.get("image_url") as string)?.trim() ?? "";
    const is_active = formData.get("is_active") === "true";

    await pool.query(
      `UPDATE services SET
         name = $1,
         description = NULLIF($2, ''),
         price = $3,
         duration_mins = $4,
         category_id = $5,
         category = CASE WHEN $5::uuid IS NOT NULL THEN NULL ELSE category END,
         image_url = NULLIF($6, ''),
         is_active = $7,
         is_draft = false
       WHERE id = $8 AND tenant_id = $9`,
      [
        name,
        description,
        parseFloat(price),
        parseInt(duration_mins, 10),
        categoryId,
        imageUrl,
        is_active,
        id,
        tenant.id,
      ]
    );

    return NextResponse.redirect(new URL(`/services/${id}`, req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
