import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { normalizeWebsiteTemplate } from "@/lib/website-templates";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const plan_tier = formData.get('plan_tier') as string;
    const primary_color = formData.get('primary_color') as string;
    const password = formData.get('password') as string;
    const business_started_at = (formData.get("business_started_at") as string) || null;
    const website_template = normalizeWebsiteTemplate(
      formData.get("website_template") as string | null
    );

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO tenants (
         name, slug, plan_tier, primary_color, password_hash,
         website_template, business_started_at,
         tenant_status, website_status, trial_started_at, trial_ends_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'trial', 'draft', NOW(), NOW() + INTERVAL '14 days')`,
      [
        name,
        slug,
        plan_tier,
        primary_color,
        password_hash,
        website_template,
        business_started_at,
      ]
    );

    return NextResponse.redirect(
      new URL('/admin/tenants', req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}