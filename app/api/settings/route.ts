import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenant_id = formData.get("tenant_id") as string;
    const action = formData.get("action") as string;

    if (action === "info") {
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      const tagline = formData.get("tagline") as string;
      const about = formData.get("about") as string;
      const address = formData.get("address") as string;
      const hours = formData.get("hours") as string;

      await pool.query(
        `UPDATE tenants SET
           name = $1,
           slug = $2,
           tagline = NULLIF($3, ''),
           about = NULLIF($4, ''),
           address = NULLIF($5, ''),
           hours = NULLIF($6, '')
         WHERE id = $7`,
        [name, slug, tagline, about, address, hours, tenant_id]
      );
    }

    if (action === "branding") {
      const primary_color = formData.get("primary_color") as string;
      const logo_url = formData.get("logo_url") as string;
      const hero_image_url = formData.get("hero_image_url") as string;

      await pool.query(
        `UPDATE tenants SET
           primary_color = $1,
           logo_url = NULLIF($2, ''),
           hero_image_url = NULLIF($3, '')
         WHERE id = $4`,
        [primary_color, logo_url, hero_image_url, tenant_id]
      );
    }

    return NextResponse.redirect(new URL("/settings", req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
