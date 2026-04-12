import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenant_id = formData.get('tenant_id') as string;
    const tagline = formData.get('tagline') as string;
    const about = formData.get('about') as string;
    const address = formData.get('address') as string;
    const hours = formData.get('hours') as string;
    const hero_image_url = formData.get('hero_image_url') as string;

    await pool.query(
      `UPDATE tenants SET
         tagline = NULLIF($1, ''),
         about = NULLIF($2, ''),
         address = NULLIF($3, ''),
         hours = NULLIF($4, ''),
         hero_image_url = NULLIF($5, '')
       WHERE id = $6`,
      [tagline, about, address, hours, hero_image_url, tenant_id]
    );

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenant_id}`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}