import { TenantsFilters } from "@/components/admin/TenantsFilters";
import { EyeIcon, PlusIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import Link from "next/link";

type QueryParams = {
  q?: string;
  plan?: string;
  status?: string;
  template?: string;
  sort?: string;
};

const PLAN_OPTIONS = ["solo", "hub", "agency"] as const;
const PLAN_LABELS: Record<(typeof PLAN_OPTIONS)[number], string> = {
  solo: "Solo",
  hub: "Hub",
  agency: "Agency",
};

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const plan = (params.plan ?? "all").toLowerCase();
  const status = (params.status ?? "all").toLowerCase();
  const template = (params.template ?? "all").toLowerCase();
  const sort = (params.sort ?? "newest").toLowerCase();

  const where: string[] = ["t.is_admin = false"];
  const values: string[] = [];

  if (q) {
    values.push(`%${q}%`);
    where.push(
      `(t.name ILIKE $${values.length} OR t.slug ILIKE $${values.length})`
    );
  }

  if (PLAN_OPTIONS.includes(plan as (typeof PLAN_OPTIONS)[number])) {
    values.push(plan);
    where.push(`t.plan_tier = $${values.length}`);
  }

  if (template !== "all") {
    values.push(template);
    where.push(`COALESCE(t.website_template, 'signuture') = $${values.length}`);
  }

  if (["draft", "pending_approval", "published"].includes(status)) {
    values.push(status);
    where.push(`COALESCE(t.website_status, 'draft') = $${values.length}`);
  }

  const orderBy =
    sort === "oldest"
      ? "t.created_at ASC"
      : sort === "name_asc"
        ? "t.name ASC"
        : sort === "name_desc"
          ? "t.name DESC"
          : "t.created_at DESC";

  const result = await pool.query(
    `SELECT
       t.id,
       t.name,
       t.slug,
       t.plan_tier,
       t.primary_color,
       COALESCE(t.website_template, 'signuture') AS website_template,
       COALESCE(t.website_status, 'draft') AS website_status,
       t.created_at,
       COALESCE(t.tenant_status, 'trial') AS tenant_status,
       COUNT(b.id)::int AS booking_count
     FROM tenants t
     LEFT JOIN bookings b ON t.id = b.tenant_id
     WHERE ${where.join(" AND ")}
     GROUP BY t.id
     ORDER BY ${orderBy}`,
    values
  );

  const tenants = result.rows;

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Tenants
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Manage company accounts, plans, and templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/tenants/new"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            <PlusIcon size={16} />
            Add Tenant
          </Link>
        </div>
      </div>

      <TenantsFilters
        q={q}
        plan={plan}
        status={status}
        template={template}
        sort={sort}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {tenants.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No tenants found.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Tenant</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Template</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Started</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="text-sm text-gray-800">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
                          style={{
                            backgroundColor: tenant.primary_color ?? 'var(--color-brand-600)',
                          }}
                        >
                          {tenant.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {tenant.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {tenant.slug}.SoloHub.nl
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium capitalize text-violet-700">
                        {PLAN_LABELS[tenant.plan_tier as keyof typeof PLAN_LABELS] ??
                          tenant.plan_tier}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                        {tenant.website_template}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 capitalize">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            tenant.website_status === "published"
                              ? "bg-emerald-500"
                              : tenant.website_status === "pending_approval"
                                ? "bg-amber-500"
                                : "bg-gray-400"
                          }`}
                        />
                        {tenant.website_status === "pending_approval"
                          ? "Pending approval"
                          : tenant.website_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(tenant.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="inline-flex min-h-9 items-center justify-center rounded-[8px] border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <EyeIcon
                          size={13}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 4,
                          }}
                        />{" "}
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
          <p>
            Showing {tenants.length} tenant{tenants.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-gray-200 px-2.5 py-1.5 text-gray-400"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-gray-200 px-2.5 py-1.5 text-gray-400"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
