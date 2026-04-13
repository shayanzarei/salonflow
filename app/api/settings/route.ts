import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

const SECTION_KEYS = [
  "section_services",
  "section_team",
  "section_reviews",
] as const;

export async function POST(req: NextRequest) {
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

      for (const key of SECTION_KEYS) {
        const enabled = formData.get(key) === "true";
        await pool.query(
          `INSERT INTO feature_flags (tenant_id, feature, enabled)
           VALUES ($1, $2, $3)
           ON CONFLICT (tenant_id, feature)
           DO UPDATE SET enabled = EXCLUDED.enabled`,
          [tenant.id, key, enabled]
        );
      }
    }

    return NextResponse.redirect(new URL("/settings", req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
