import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const tenant_id = formData.get('tenant_id') as string;
        const feature = formData.get('feature') as string;
        const enabled = formData.get('enabled') === 'true';

        // upsert the flag
        await pool.query(
            `INSERT INTO feature_flags (tenant_id, feature, enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id, feature)
       DO UPDATE SET enabled = $3`,
            [tenant_id, feature, enabled]
        );

        return NextResponse.redirect(
            new URL(`/admin/tenants/${tenant_id}`, req.url)
        );
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}