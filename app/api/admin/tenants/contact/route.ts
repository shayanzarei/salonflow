import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Contact and social-profile edits. Address powers the LocalBusiness JSON-LD
 * (PostalAddress); each social URL is also pushed into the schema's
 * `sameAs` array. Empty strings become NULL so the JSON-LD builder can skip
 * absent values rather than rendering `""`.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const phone = (formData.get("phone") as string | null) ?? "";
    const address = (formData.get("address") as string | null) ?? "";
    const instagram = (formData.get("social_instagram") as string | null) ?? "";
    const facebook = (formData.get("social_facebook") as string | null) ?? "";
    const tiktok = (formData.get("social_tiktok") as string | null) ?? "";
    const youtube = (formData.get("social_youtube") as string | null) ?? "";

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE tenants
       SET phone = NULLIF($1, ''),
           address = NULLIF($2, ''),
           social_instagram = NULLIF($3, ''),
           social_facebook = NULLIF($4, ''),
           social_tiktok = NULLIF($5, ''),
           social_youtube = NULLIF($6, '')
       WHERE id = $7`,
      [phone, address, instagram, facebook, tiktok, youtube, tenantId]
    );

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenantId}/website?tab=contact`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
