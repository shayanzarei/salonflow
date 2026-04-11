import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const plan_tier = formData.get('plan_tier') as string;
    const primary_color = formData.get('primary_color') as string;
    const password = formData.get('password') as string;

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO tenants (name, slug, plan_tier, primary_color, password_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, slug, plan_tier, primary_color, password_hash]
    );

    return NextResponse.redirect(
      new URL('/admin/tenants', req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}