import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = String(formData.get("tenant_id") ?? "");
    const key = String(formData.get("key") ?? "");
    const valueType = String(formData.get("value_type") ?? "");

    if (!tenantId || !key || !["boolean", "limit"].includes(valueType)) {
      return NextResponse.json({ error: "Invalid override payload." }, { status: 400 });
    }

    if (valueType === "boolean") {
      const enabled = formData.get("value") === "true";
      await pool.query(
        `INSERT INTO tenant_entitlement_overrides (tenant_id, key, value_type, boolean_value, numeric_value, updated_at)
         VALUES ($1, $2, 'boolean', $3, NULL, NOW())
         ON CONFLICT (tenant_id, key)
         DO UPDATE SET boolean_value = EXCLUDED.boolean_value, numeric_value = NULL, value_type = 'boolean', updated_at = NOW()`,
        [tenantId, key, enabled]
      );
    } else {
      const raw = String(formData.get("value") ?? "").trim();
      const numericValue = raw === "" ? null : Number(raw);
      await pool.query(
        `INSERT INTO tenant_entitlement_overrides (tenant_id, key, value_type, boolean_value, numeric_value, updated_at)
         VALUES ($1, $2, 'limit', NULL, $3, NOW())
         ON CONFLICT (tenant_id, key)
         DO UPDATE SET numeric_value = EXCLUDED.numeric_value, boolean_value = NULL, value_type = 'limit', updated_at = NOW()`,
        [tenantId, key, Number.isNaN(numericValue) ? null : numericValue]
      );
    }

    return NextResponse.redirect(new URL(`/admin/tenants/${tenantId}`, req.url));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save override.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
