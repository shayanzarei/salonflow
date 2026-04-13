import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  try {
    const formData = await req.formData();

    const tenant_id = formData.get('tenant_id') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;

    await pool.query(
      `INSERT INTO staff (tenant_id, name, role, email)
       VALUES ($1, $2, $3, $4)`,
      [tenant_id, name, role, email]
    );

    return NextResponse.redirect(new URL('/staff', req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
