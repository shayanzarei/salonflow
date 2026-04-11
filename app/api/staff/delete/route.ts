import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const id = formData.get('id') as string;
        const tenant_id = formData.get('tenant_id') as string;

        await pool.query(
            `DELETE FROM staff WHERE id = $1 AND tenant_id = $2`,
            [id, tenant_id]
        );

        return NextResponse.redirect(
            new URL('/staff', req.url)
        );
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}