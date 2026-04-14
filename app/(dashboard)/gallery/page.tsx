import { GalleryManager } from "@/components/dashboard/GalleryManager";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function GalleryPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

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
