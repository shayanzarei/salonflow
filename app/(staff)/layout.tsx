import LogoutButton from "@/components/dashboard/LogoutButton";
import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // verify this is a staff member session
  const result = await pool.query(
    `SELECT s.*, t.name AS salon_name, t.primary_color
     FROM staff s
     JOIN tenants t ON s.tenant_id = t.id
     WHERE s.email = $1`,
    [(session as any).slug]
  );

  const staffMember = result.rows[0];
  if (!staffMember) redirect("/dashboard");

  const brand = staffMember.primary_color ?? "#7C3AED";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: brand }}
            >
              {staffMember.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {staffMember.name}
              </p>
              <p className="text-xs text-gray-400">{staffMember.salon_name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/staff-portal"
            className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            My schedule
          </Link>
        </nav>

        <div className="px-6 py-4 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
