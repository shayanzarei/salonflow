import pool from "@/lib/db";
import { normalizeWebsiteTemplate } from "@/lib/website-templates";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const websiteTemplate = normalizeWebsiteTemplate(
      formData.get("website_template") as string | null
    );

    await pool.query(
      `UPDATE tenants
       SET website_template = $1
       WHERE id = $2`,
      [websiteTemplate, tenantId]
    );

    return NextResponse.redirect(new URL(`/admin/tenants/${tenantId}`, req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
