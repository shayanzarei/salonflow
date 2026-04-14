import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";
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
    const saveIntent = (formData.get("save_intent") as string) || "publish";
    const isDraft = saveIntent === "draft";

    const nameRaw = (formData.get("name") as string) ?? "";
    const name = nameRaw.trim();
    if (!name) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }

    const description = (formData.get("description") as string) ?? "";
    const priceRaw = formData.get("price") as string;
    const durationRaw = formData.get("duration_mins") as string;
    const categoryRaw = (formData.get("category") as string)?.trim() ?? "";
    const categoryId = (formData.get("category_id") as string)?.trim() || null;
    const is_active = formData.get("is_active") === "true";

    let price: number;
    let duration_mins: number;
    let category: string;

    if (isDraft) {
      price = parseFloat(priceRaw || "0");
      if (Number.isNaN(price) || price < 0) price = 0;
      duration_mins = parseInt(durationRaw || "60", 10);
      if (Number.isNaN(duration_mins) || duration_mins < 5) duration_mins = 60;
      category = (SERVICE_CATEGORIES as readonly string[]).includes(categoryRaw)
        ? categoryRaw
        : null as unknown as string;
    } else {
      if (!priceRaw || !durationRaw) {
        return NextResponse.json(
          { error: "Price and duration are required" },
          { status: 400 }
        );
      }
      price = parseFloat(priceRaw);
      duration_mins = parseInt(durationRaw, 10);
      if (Number.isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      if (Number.isNaN(duration_mins) || duration_mins < 5) {
        return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
      }
      // category_id (custom category) takes priority; legacy text category is optional
      if (!categoryId && !(SERVICE_CATEGORIES as readonly string[]).includes(categoryRaw)) {
        category = null as unknown as string;
      } else {
        category = (SERVICE_CATEGORIES as readonly string[]).includes(categoryRaw)
          ? categoryRaw
          : null as unknown as string;
      }
    }

    const staffIds = formData
      .getAll("staff_ids")
      .map((v) => String(v))
      .filter(Boolean);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insert = await client.query(
        `INSERT INTO services (
           tenant_id, name, description, price, duration_mins, category, category_id, is_active, is_draft
         )
         VALUES ($1, $2, NULLIF($3, ''), $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          tenant.id,
          name,
          description,
          price,
          duration_mins,
          category,
          categoryId,
          is_active,
          isDraft,
        ]
      );

      const serviceId = insert.rows[0].id as string;

      if (staffIds.length > 0) {
        const staffCheck = await client.query(
          `SELECT id FROM staff WHERE tenant_id = $1 AND id = ANY($2::uuid[])`,
          [tenant.id, staffIds]
        );
        const allowed = new Set(staffCheck.rows.map((r) => r.id as string));
        for (const sid of staffIds) {
          if (!allowed.has(sid)) continue;
          await client.query(
            `INSERT INTO service_staff (service_id, staff_id, tenant_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (service_id, staff_id) DO NOTHING`,
            [serviceId, sid, tenant.id]
          );
        }
      }

      await client.query("COMMIT");

      return NextResponse.redirect(new URL(`/services/${serviceId}`, req.url));
    } catch (inner: unknown) {
      await client.query("ROLLBACK");
      throw inner;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
