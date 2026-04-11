export default function SalonDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Salon dashboard
        </p>
        <p className="text-xs text-zinc-500">
          Auth guard + tenant context go here.
        </p>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
