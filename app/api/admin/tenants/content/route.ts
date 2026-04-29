import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * Editorial content for the salon's public site — narrative copy and imagery.
 * Address, phone, and socials moved to /api/admin/tenants/contact; structured
 * opening hours live at /api/admin/tenants/opening-hours. The display "hours"
 * string is still part of this payload because it's a content choice (free
 * text the operator wrote) rather than scheduling data.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenant_id = formData.get('tenant_id') as string;
    const tagline = formData.get('tagline') as string;
    const about = formData.get('about') as string;
    const hours = formData.get('hours') as string;
    const hero_image_url = formData.get('hero_image_url') as string;
    const about_image_url = formData.get('about_image_url') as string;

    await pool.query(
      `UPDATE tenants SET
         tagline = NULLIF($1, ''),
         about = NULLIF($2, ''),
         hours = NULLIF($3, ''),
         hero_image_url = NULLIF($4, ''),
         about_image_url = NULLIF($5, '')
       WHERE id = $6`,
      [tagline, about, hours, hero_image_url, about_image_url, tenant_id]
    );

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenant_id}/website?tab=content`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
