import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const VALID_PLANS = new Set(["solo", "hub", "agency"]);
const VALID_ROLES = new Set([
  "freelancer",
  "consultant",
  "agency-owner",
  "entrepreneur",
  "small-business",
  "other",
]);

/**
 * Owner identity + plan tier + business-started date. One route on purpose —
 * the access page posts both the owner card and the plan card here, with
 * each card re-posting the other's fields as hidden inputs so partial
 * updates don't blank columns.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 }
      );
    }

    const ownerEmail = (formData.get("owner_email") as string | null) ?? "";
    const ownerFirst =
      (formData.get("owner_first_name") as string | null) ?? "";
    const ownerLast = (formData.get("owner_last_name") as string | null) ?? "";
    const ownerRoleRaw =
      (formData.get("owner_role") as string | null)?.trim() ?? "";
    const planTierRaw = (formData.get("plan_tier") as string | null) ?? "";
    const businessStartedAt =
      (formData.get("business_started_at") as string | null) || null;

    const ownerRole =
      ownerRoleRaw === "" || VALID_ROLES.has(ownerRoleRaw) ? ownerRoleRaw : "";

    if (planTierRaw && !VALID_PLANS.has(planTierRaw)) {
      return NextResponse.json(
        { error: "Invalid plan tier" },
        { status: 400 }
      );
    }

    // Two branches keep parameter indices simple. The owner-card form omits
    // plan_tier entirely so we don't want to overwrite it with NULL.
    if (planTierRaw) {
      await pool.query(
        `UPDATE tenants SET
           owner_email         = NULLIF($1, ''),
           owner_first_name    = NULLIF($2, ''),
           owner_last_name     = NULLIF($3, ''),
           owner_role          = NULLIF($4, ''),
           business_started_at = $5,
           plan_tier           = $6
         WHERE id = $7`,
        [
          ownerEmail,
          ownerFirst,
          ownerLast,
          ownerRole,
          businessStartedAt,
          planTierRaw,
          tenantId,
        ]
      );
    } else {
      await pool.query(
        `UPDATE tenants SET
           owner_email         = NULLIF($1, ''),
           owner_first_name    = NULLIF($2, ''),
           owner_last_name     = NULLIF($3, ''),
           owner_role          = NULLIF($4, ''),
           business_started_at = $5
         WHERE id = $6`,
        [
          ownerEmail,
          ownerFirst,
          ownerLast,
          ownerRole,
          businessStartedAt,
          tenantId,
        ]
      );
    }

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenantId}/access`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
