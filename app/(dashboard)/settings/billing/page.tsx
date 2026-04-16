import { getPackageCardBullets } from "@/config/packages";
import { getPackageMap } from "@/lib/packages";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BillingPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const brand = tenant.primary_color ?? "#7C3AED";
  const packageMap = await getPackageMap();
  const pkg = packageMap[tenant.plan_tier];
  const planLabel = pkg?.name ?? tenant.plan_tier;
  const planPrice = pkg ? `€${pkg.monthlyPrice}/mo` : "Custom";
  const planFeatures = pkg ? getPackageCardBullets(pkg) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan & billing</h1>
        <p className="mt-1 text-gray-500">
          Review your current plan and billing actions.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: brand }}
            >
              {planLabel} plan
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-900">{planPrice}</p>
            <p className="text-sm text-gray-500">
              Next billing: <span className="text-gray-700">-</span>
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {planFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="text-green-600">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/settings/billing"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Manage billing
          </Link>
          <Link
            href="/settings/billing"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    </div>
  );
}
