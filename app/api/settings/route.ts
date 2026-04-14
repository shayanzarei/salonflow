import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const action = formData.get("action") as string;

    if (action === "info") {
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      const tagline = formData.get("tagline") as string;
      const about = formData.get("about") as string;
      const address = formData.get("address") as string;
      const hours = formData.get("hours") as string;
      const phone = formData.get("phone") as string;
      const logo_url = formData.get("logo_url") as string;

      await pool.query(
        `UPDATE tenants SET
           name = $1,
           slug = $2,
           tagline = NULLIF($3, ''),
           about = NULLIF($4, ''),
           address = NULLIF($5, ''),
           hours = NULLIF($6, ''),
           phone = NULLIF($7, ''),
           logo_url = NULLIF($8, '')
         WHERE id = $9`,
        [
          name,
          slug,
          tagline,
          about,
          address,
          hours,
          phone,
          logo_url,
          tenant.id,
        ]
      );
    }

    if (action === "branding") {
      const primary_color = (formData.get("primary_color") as string)?.trim();
      const hero_image_url = formData.get("hero_image_url") as string;

      const color =
        primary_color && /^#[0-9A-Fa-f]{6}$/.test(primary_color)
          ? primary_color
          : tenant.primary_color ?? "#7C3AED";

      await pool.query(
        `UPDATE tenants SET
           primary_color = $1,
           hero_image_url = NULLIF($2, '')
         WHERE id = $3`,
        [color, hero_image_url, tenant.id]
      );
    }

    if (action === "social") {
      const instagram = (formData.get("social_instagram") as string) ?? "";
      const facebook  = (formData.get("social_facebook")  as string) ?? "";
      const tiktok    = (formData.get("social_tiktok")    as string) ?? "";
      const youtube   = (formData.get("social_youtube")   as string) ?? "";

      await pool.query(
        `UPDATE tenants SET
           social_instagram = NULLIF($1, ''),
           social_facebook  = NULLIF($2, ''),
           social_tiktok    = NULLIF($3, ''),
           social_youtube   = NULLIF($4, '')
         WHERE id = $5`,
        [instagram, facebook, tiktok, youtube, tenant.id]
      );
    }

    return NextResponse.redirect(new URL("/settings", req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
