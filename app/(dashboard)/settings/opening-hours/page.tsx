import SalonWorkingHoursForm from "@/components/dashboard/SalonWorkingHoursForm";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function OpeningHoursPage({
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
  const brand = tenant.primary_color ?? "#7C3AED";
  const result = await pool.query(
    `SELECT day_of_week, start_time, end_time, is_working
     FROM salon_working_hours
     WHERE tenant_id = $1
     ORDER BY day_of_week`,
    [tenant.id]
  );

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Opening hours</h1>
        <p className="mt-1 text-gray-500">
          Manage salon-level booking availability by day.
        </p>
      </div>
      <SalonWorkingHoursForm
        brand={brand}
        initialHours={result.rows}
        redirectTo={redirectTo}
      />
    </div>
  );
}
