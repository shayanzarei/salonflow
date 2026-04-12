import LogoutButton from "@/components/dashboard/LogoutButton";
import SidebarNav from "@/components/dashboard/SidebarNav";
import { authOptions } from "@/lib/auth-options";
import { getTenant } from "@/lib/tenant";
import { getServerSession } from "next-auth";
import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: tenant.primary_color ?? "#7C3AED" }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {tenant.name}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {tenant.plan_tier} plan
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <SidebarNav brandColor={tenant.primary_color ?? "#7C3AED"} />

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            className="block text-xs text-gray-400 hover:text-gray-600"
          >
            View customer site →
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
