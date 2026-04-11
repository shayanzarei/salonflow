import pool from '@/lib/db';
import { hasFeature } from '@/lib/features';
import { getTenant } from '@/lib/tenant';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let tenant = await getTenant();

    // in development, fall back to the first tenant so we can test
    if (!tenant && process.env.NODE_ENV === 'development') {
      const result = await pool.query(
        'SELECT * FROM tenants LIMIT 1'
      );
      tenant = result.rows[0] ?? null;
    }

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const canUseSms = await hasFeature(tenant, 'sms_reminders');
    const canUseAnalytics = await hasFeature(tenant, 'analytics');

    return NextResponse.json({
      tenant,
      features: {
        sms_reminders: canUseSms,
        analytics: canUseAnalytics,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}