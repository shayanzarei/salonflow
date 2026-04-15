import MainSiteForgotPasswordPage from "@/components/marketing/MainSiteForgotPasswordPage";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }

  return <MainSiteForgotPasswordPage />;
}
