import { PACKAGE_ENTITLEMENTS, type PackageId } from "@/config/packages";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const packageId = formData.get("package_id") as PackageId | null;

    if (!packageId) {
      return NextResponse.json({ error: "Package is required." }, { status: 400 });
    }

    const name = String(formData.get("name") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const monthlyPrice = Number(formData.get("monthly_price") ?? 0);
    const annualPrice = Number(formData.get("annual_price") ?? 0);
    const featured = formData.get("featured") === "on";
    const sortOrder = Number(formData.get("sort_order") ?? 0);
    const isActive = formData.get("is_active") === "on";

    await pool.query("BEGIN");
    await pool.query(
      `UPDATE subscription_packages
       SET name = $2,
           subtitle = $3,
           monthly_price = $4,
           annual_price = $5,
           featured = $6,
           sort_order = $7,
           is_active = $8,
           updated_at = NOW()
       WHERE id = $1`,
      [packageId, name, subtitle, monthlyPrice, annualPrice, featured, sortOrder, isActive]
    );

    for (const item of PACKAGE_ENTITLEMENTS) {
      const inputName = `entitlement:${item.key}`;
      if (!formData.has(inputName)) continue;

      if (item.type === "boolean") {
        const enabled = formData.get(inputName) === "on";
        await pool.query(
          `INSERT INTO package_entitlements (package_id, key, value_type, boolean_value, numeric_value, updated_at)
           VALUES ($1, $2, 'boolean', $3, NULL, NOW())
           ON CONFLICT (package_id, key)
           DO UPDATE SET boolean_value = EXCLUDED.boolean_value, numeric_value = NULL, value_type = 'boolean', updated_at = NOW()`,
          [packageId, item.key, enabled]
        );
      } else {
        const raw = String(formData.get(inputName) ?? "").trim();
        const parsed = raw === "" ? null : Number(raw);
        await pool.query(
          `INSERT INTO package_entitlements (package_id, key, value_type, boolean_value, numeric_value, updated_at)
           VALUES ($1, $2, 'limit', NULL, $3, NOW())
           ON CONFLICT (package_id, key)
           DO UPDATE SET numeric_value = EXCLUDED.numeric_value, boolean_value = NULL, value_type = 'limit', updated_at = NOW()`,
          [packageId, item.key, Number.isNaN(parsed) ? null : parsed]
        );
      }
    }

    await pool.query("COMMIT");
    return NextResponse.redirect(new URL("/admin/packages", req.url));
  } catch (error: unknown) {
    await pool.query("ROLLBACK").catch(() => undefined);
    const message = error instanceof Error ? error.message : "Failed to update package.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
