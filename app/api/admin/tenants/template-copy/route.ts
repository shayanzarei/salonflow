import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Super-admin endpoint for the Signature template copy overrides
 * (migration 019). All seven fields are optional — empty strings are
 * normalized to NULL via NULLIF so the template falls back to its
 * hard-coded default. Posts back to website?tab=copy on success.
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

    const heroEyebrow = (formData.get("tpl_hero_eyebrow") as string) ?? "";
    const heroDescription =
      (formData.get("tpl_hero_description") as string) ?? "";
    const servicesTitle =
      (formData.get("tpl_services_title") as string) ?? "";
    const servicesDescription =
      (formData.get("tpl_services_description") as string) ?? "";
    const ctaTitle = (formData.get("tpl_cta_title") as string) ?? "";
    const ctaDescription =
      (formData.get("tpl_cta_description") as string) ?? "";
    const footerAbout = (formData.get("tpl_footer_about") as string) ?? "";

    await pool.query(
      `UPDATE tenants SET
         tpl_hero_eyebrow         = NULLIF($1, ''),
         tpl_hero_description     = NULLIF($2, ''),
         tpl_services_title       = NULLIF($3, ''),
         tpl_services_description = NULLIF($4, ''),
         tpl_cta_title            = NULLIF($5, ''),
         tpl_cta_description      = NULLIF($6, ''),
         tpl_footer_about         = NULLIF($7, '')
       WHERE id = $8`,
      [
        heroEyebrow,
        heroDescription,
        servicesTitle,
        servicesDescription,
        ctaTitle,
        ctaDescription,
        footerAbout,
        tenantId,
      ]
    );

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenantId}/website?tab=copy`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
