import { AddServiceForm } from "@/components/dashboard/AddServiceForm";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const { redirect_to } = await searchParams;
  const redirectTo =
    redirect_to && redirect_to.startsWith("/") && !redirect_to.startsWith("//")
      ? redirect_to
      : "";

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const [staffResult, categoriesResult] = await Promise.all([
    pool.query(
      `SELECT id, name, role, avatar_url FROM staff WHERE tenant_id = $1 ORDER BY name`,
      [tenant.id]
    ),
    pool.query(
      `SELECT id, name FROM service_categories WHERE tenant_id = $1 ORDER BY sort_order, name`,
      [tenant.id]
    ),
  ]);

  return (
    <div>
      <div className="mb-7">
        <Link
          href="/services"
          className="mb-3 inline-flex items-center gap-1.5 text-body-sm text-ink-500 no-underline"
        >
          ← Back to Services
        </Link>
        <h1 className="mb-1.5 text-h1 font-bold text-ink-900">
          Add New Service
        </h1>
        <p className="text-body-sm text-ink-500">
          Create a new service for your salon
        </p>
      </div>

      <AddServiceForm
        brand={brand}
        staff={staffResult.rows}
        categories={categoriesResult.rows}
        redirectTo={redirectTo}
      />
    </div>
  );
}
