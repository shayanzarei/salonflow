import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tenant_id = formData.get('tenant_id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const duration_mins = formData.get('duration_mins') as string;

    await pool.query(
      `INSERT INTO services (tenant_id, name, description, price, duration_mins)
       VALUES ($1, $2, $3, $4, $5)`,
      [tenant_id, name, description, parseFloat(price), parseInt(duration_mins)]
    );

    return NextResponse.redirect(
      new URL('/services', req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}