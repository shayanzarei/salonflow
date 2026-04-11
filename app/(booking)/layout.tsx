import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  // if no tenant found just render children without branding
  // this handles cases where layout bleeds into admin/dashboard routes
  if (!tenant) {
    return notFound();
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ '--brand-color': tenant.primary_color ?? '#7C3AED' } as React.CSSProperties}
    >
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
            >
              {tenant.name.charAt(0)}
            </div>
            <span className="font-semibold text-gray-900">{tenant.name}</span>
          </div>
          
            <a href="/book"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
          >
            Book now
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
          Powered by SalonFlow
        </div>
      </footer>
    </div>
  );
}