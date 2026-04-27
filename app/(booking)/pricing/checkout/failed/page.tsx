import { CheckoutResultLayout } from "@/components/marketing/CheckoutResultLayout";
import { Button } from "@/components/ds/Button";
import { isMainSiteHost } from "@/lib/main-site";
import { ShieldIcon } from "@/components/ui/Icons";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CheckoutFailedPage() {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }

  return (
    <CheckoutResultLayout>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-700">
          <ShieldIcon size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Payment did not go through
        </h1>
        <p className="mt-3 text-sm text-ink-500 sm:text-base">
          Your bank or card issuer declined or interrupted the payment. You have
          not been charged. Try again with another method, or contact us and we
          will help you finish setup.
        </p>
        <div className="mt-8 w-full rounded-2xl border border-ink-200/80 bg-white/90 p-5 text-left text-sm text-ink-500 shadow-sm backdrop-blur-sm">
          <p className="font-medium text-ink-700">What you can do next</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>Retry checkout from the pricing page with a different card or bank.</li>
            <li>Confirm with your bank that online payments to Stripe are allowed.</li>
            <li>Email us from the contact page with the time you attempted payment.</li>
          </ul>
        </div>
        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/pricing">Try again</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/contact">Get help</Link>
          </Button>
        </div>
      </div>
    </CheckoutResultLayout>
  );
}
