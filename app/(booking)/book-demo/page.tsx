import MainSiteBookDemoPage from "@/components/marketing/MainSiteBookDemoPage";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function BookDemoPage() {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }
  return <MainSiteBookDemoPage />;
}
