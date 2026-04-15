import { getTenant } from "@/lib/tenant";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (isMainSiteHost(host)) return <>{children}</>;

  const tenant = await getTenant();
  if (!tenant) return <>{children}</>;

  if (tenant.website_status !== "published") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Website coming soon</h1>
        <p className="mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          This salon is currently preparing their public booking website.
          Please check back later.
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
