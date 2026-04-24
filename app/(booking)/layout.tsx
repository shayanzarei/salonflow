import { getServerTranslations } from "@/lib/i18n/server";
import { canAccessPublicWebsite, getTenant } from "@/lib/tenant";
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

  if (!canAccessPublicWebsite(tenant)) {
    const { t } = await getServerTranslations();
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.website.comingSoonTitle}</h1>
        <p className="mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          {t.website.comingSoonBody}
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
