import pool from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { Tenant } from "@/types/tenant";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";

export async function getTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  let slug = headersList.get("x-tenant-slug");

  // Dashboard has no subdomain header; resolve tenant from the signed-in session first.
  if (!slug) {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (session?.slug && !session.isAdmin) {
      slug = session.slug;
    }
  }

  // In development, use DEV_TENANT_SLUG only as the last fallback.
  if (!slug && process.env.NODE_ENV === "development") {
    slug = process.env.DEV_TENANT_SLUG ?? null;
  }

  if (!slug) return null;

  const result = await pool.query(
    'SELECT * FROM tenants WHERE slug = $1',
    [slug]
  );

  return result.rows[0] ?? null;
}