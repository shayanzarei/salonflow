import { CheckoutResultLayout } from "@/components/marketing/CheckoutResultLayout";
import { Button } from "@/components/ds/Button";
import { isMainSiteHost } from "@/lib/main-site";
import { XIcon } from "@/components/ui/Icons";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CheckoutCancelPage() {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }

  return (
    <CheckoutResultLayout>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-600">
          <XIcon size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Checkout cancelled
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          No charge was made. You can return to pricing whenever you are ready,
          or reach out if you need a different package or billing cycle.
        </p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/pricing">View plans again</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>
      </div>
    </CheckoutResultLayout>
  );
}
