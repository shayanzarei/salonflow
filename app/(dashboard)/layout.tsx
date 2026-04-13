import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { authOptions } from "@/lib/auth-options";
import { getTenant } from "@/lib/tenant";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <DashboardChrome
      brand={brand}
      tenantName={tenant.name}
      planTier={tenant.plan_tier}
    >
      {children}
    </DashboardChrome>
  );
}
