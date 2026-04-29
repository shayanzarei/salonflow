import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Override the auto-generated SEO title and meta description. NULL means
 * "use the auto value from lib/seo/auto-meta.ts" — that's the default and
 * the recommended path. Super-admin sets these only when the auto copy
 * isn't a good fit for a particular tenant.
 *
 * No length validation here because Google's truncation behavior is a
 * recommendation, not a constraint — over-budget copy still works, it just
 * gets clipped in SERPs. The form surfaces "≤ 60" / "≤ 160" hints instead.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const seoTitle = (formData.get("seo_title") as string | null) ?? "";
    const metaDescription =
      (formData.get("meta_description") as string | null) ?? "";

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE tenants
       SET seo_title = NULLIF($1, ''),
           meta_description = NULLIF($2, '')
       WHERE id = $3`,
      [seoTitle, metaDescription, tenantId]
    );

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenantId}/website?tab=seo`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
