import { GalleryManager } from "@/components/dashboard/GalleryManager";
import pool from "@/lib/db";
import { hasPackageFeature } from "@/lib/packages";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GalleryPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";
  const galleryEnabled = await hasPackageFeature(tenant, "gallery");

  if (!galleryEnabled) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-bold text-amber-900">Gallery is not included</h1>
          <p className="mt-2 text-sm text-amber-800">
            This feature is not available on your current subscription. Upgrade your
            package to unlock before/after gallery management on your booking site.
          </p>
          <Link
            href="/settings/billing"
            className="mt-4 inline-flex rounded-[10px] bg-amber-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-amber-700"
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    );
  }

  const { rows } = await pool.query(
    `SELECT * FROM gallery_items WHERE tenant_id = $1 ORDER BY sort_order, created_at`,
    [tenant.id]
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <p className="mt-1 text-gray-500">
          Manage before &amp; after photos shown on your booking site
        </p>
      </div>

      <GalleryManager initialItems={rows} brand={brand} />
    </div>
  );
}
