import { CheckoutSuccessContent } from "@/components/marketing/CheckoutSuccessContent";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }

  const { session_id: sessionId } = await searchParams;
  if (!sessionId?.startsWith("cs_")) {
    redirect("/pricing");
  }

  return <CheckoutSuccessContent sessionId={sessionId} />;
}
