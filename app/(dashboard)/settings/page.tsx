import { SettingsProfileForm } from "@/components/dashboard/SettingsProfileForm";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function SettingsPage({
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
      : "/settings";

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-gray-500">
          Manage salon profile and branding in one place.
        </p>
      </div>

      <SettingsProfileForm
        tenant={{
          name: tenant.name,
          tagline: tenant.tagline ?? null,
          about: tenant.about ?? null,
          address: tenant.address ?? null,
          phone: tenant.phone ?? null,
          logo_url: tenant.logo_url ?? null,
          hero_image_url: tenant.hero_image_url ?? null,
          about_image_url: tenant.about_image_url ?? null,
          primary_color: tenant.primary_color ?? null,
        }}
        redirectTo={redirectTo}
      />
    </div>
  );
}
