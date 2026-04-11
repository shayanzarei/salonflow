import LogoutButton from '@/components/dashboard/LogoutButton';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  // verify this user is actually an admin
  const result = await pool.query(
    `SELECT is_admin FROM tenants WHERE slug = $1`,
    [(session.user as { email: string })?.email]
  );

  if (!result.rows[0]?.is_admin) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-sm">
              S
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">SalonFlow</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/admin', label: 'Overview' },
            { href: '/admin/tenants', label: 'Tenants' },
            { href: '/admin/subscriptions', label: 'Subscriptions' },
            { href: '/admin/settings', label: 'Settings' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}