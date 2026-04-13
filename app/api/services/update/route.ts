import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
    const category = (formData.get("category") as string)?.trim() ?? "Other";
    const is_active = formData.get("is_active") === "true";

    const safeCategory = (SERVICE_CATEGORIES as readonly string[]).includes(
      category
    )
      ? category
      : "Other";

    await pool.query(
      `UPDATE services SET
         name = $1,
         description = NULLIF($2, ''),
         price = $3,
         duration_mins = $4,
         category = $5,
         is_active = $6,
         is_draft = false
       WHERE id = $7 AND tenant_id = $8`,
      [
        name,
        description,
        parseFloat(price),
        parseInt(duration_mins, 10),
        safeCategory,
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
