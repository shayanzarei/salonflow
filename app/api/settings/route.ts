import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tenant_id = formData.get('tenant_id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const primary_color = formData.get('primary_color') as string;
    const logo_url = formData.get('logo_url') as string;

    await pool.query(
      `UPDATE tenants
       SET name = $1,
           slug = $2,
           primary_color = $3,
           logo_url = NULLIF($4, '')
       WHERE id = $5`,
      [name, slug, primary_color, logo_url, tenant_id]
    );

    return NextResponse.redirect(
      new URL('/settings', req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}