import MainSitePricingPage from "../../../components/marketing/MainSitePricingPage";
import { getPackageComparisonRows } from "@/config/packages";
import { getPackages } from "@/lib/packages";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }
  const packages = await getPackages();
  const comparisonSections = getPackageComparisonRows(packages);
  return (
    <MainSitePricingPage
      packages={packages}
      comparisonSections={comparisonSections}
    />
  );
}
