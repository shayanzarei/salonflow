import pool from "@/lib/db";
import { normalizeWebsiteTemplate } from "@/lib/website-templates";
import { NextRequest, NextResponse } from "next/server";

/**
 * Branding-only edits: template, primary color, and logo. Split from the
 * editorial /content route so the super-admin can change visual identity
 * without touching tagline/about copy.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const websiteTemplate = normalizeWebsiteTemplate(
      formData.get("website_template") as string | null
    );
    const primaryColor = (formData.get("primary_color") as string | null) ?? "";
    const logoUrl = (formData.get("logo_url") as string | null) ?? "";

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE tenants
       SET website_template = $1,
           primary_color = NULLIF($2, ''),
           logo_url = NULLIF($3, '')
       WHERE id = $4`,
      [websiteTemplate, primaryColor, logoUrl, tenantId]
    );

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenantId}/website?tab=branding`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
