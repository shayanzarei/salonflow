import { GalleryManager } from "@/components/dashboard/GalleryManager";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import pool from "@/lib/db";
import { hasPackageFeature } from "@/lib/packages";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GalleryPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';
  const galleryEnabled = await hasPackageFeature(tenant, "gallery");

  if (!galleryEnabled) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card variant="outlined" className="bg-warning-50 p-6">
          <h1 className="text-h2 font-bold text-warning-700">Gallery is not included</h1>
          <p className="mt-2 text-body-sm text-warning-700">
            This feature is not available on your current subscription. Upgrade your
            package to unlock before/after gallery management on your booking site.
          </p>
          <Button asChild variant="accent" size="md" className="mt-4">
            <Link href="/settings/billing">Upgrade plan</Link>
          </Button>
        </Card>
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
        <h1 className="text-h1 font-bold text-ink-900">Gallery</h1>
        <p className="mt-1 text-body-sm text-ink-500">
          Manage before &amp; after photos shown on your booking site
        </p>
      </div>

      <GalleryManager initialItems={rows} brand={brand} />
    </div>
  );
}
