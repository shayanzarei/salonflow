import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const websiteStatus = (formData.get("website_status") as string) || "draft";
    const note = (formData.get("website_review_note") as string) || null;

    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
    }

    if (!["draft", "pending_approval", "published"].includes(websiteStatus)) {
      return NextResponse.json({ error: "Invalid website status" }, { status: 400 });
    }

    await pool.query(
      `UPDATE tenants
       SET website_status = $1,
           tenant_status = CASE WHEN $1 = 'published' THEN 'active' ELSE 'trial' END,
           website_published_at = CASE WHEN $1 = 'published' THEN NOW() ELSE website_published_at END,
           website_review_note = $2
       WHERE id = $3`,
      [websiteStatus, note, tenantId]
    );

    return NextResponse.redirect(new URL(`/admin/tenants/${tenantId}`, req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
