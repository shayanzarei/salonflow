import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { authOptions } from "@/lib/auth-options";
import { hasPackageFeature } from "@/lib/packages";
import { getTenant } from "@/lib/tenant";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Not logged in at all
  if (!session) redirect("/login");

  // Staff members have their own portal — never let them into the owner dashboard
  if ((session as { isStaff: boolean }).isStaff === true)
    redirect("/staff-portal");

  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";
  const galleryEnabled = await hasPackageFeature(tenant, "gallery");

  return (
    <DashboardChrome
      brand={brand}
      tenantName={tenant.name}
      tenantLogoUrl={tenant.logo_url}
      planTier={tenant.plan_tier}
      galleryEnabled={galleryEnabled}
    >
      {children}
    </DashboardChrome>
  );
}
