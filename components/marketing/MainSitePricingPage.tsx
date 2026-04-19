"use client";

import MainSiteCta from "@/components/marketing/MainSiteCta";
import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import {
  getPackageCardBullets,
  type PackageEntitlementKey,
  type PackageId,
  type ResolvedPackage,
} from "@/config/packages";
import {
  MARKETING_BUTTON_BASE,
  MARKETING_BUTTON_PRIMARY,
  MARKETING_BUTTON_SECONDARY,
} from "@/components/marketing/buttonStyles";
import { CheckCircleIcon, ChevronDownIcon, XIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

type ComparisonSection = {
  category: string;
  rows: {
    key: PackageEntitlementKey;
    label: string;
    values: Record<PackageId, boolean | string | number | null>;
  }[];
};

type MainSitePricingPageProps = {
  packages: ResolvedPackage[];
  comparisonSections: ComparisonSection[];
};

function formatPrice(value: number) {
  return `€${value}`;
}

export default function MainSitePricingPage({
  packages,
  comparisonSections,
}: MainSitePricingPageProps) {
  const { t } = useLocale();
  const m = t.marketing;
  const pricingFaqs = m.pricingFaqs;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(
    () => pricingFaqs[0]?.q ?? null
  );
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  useEffect(() => {
    const first = pricingFaqs[0]?.q ?? null;
    setOpenFaq((prev) => {
      const exists = pricingFaqs.some((item) => item.q === prev);
      return exists ? prev : first;
    });
  }, [pricingFaqs]);
  const checkoutResult = searchParams.get("checkout");
  const showCheckoutSuccess =
    checkoutResult === "success" || checkoutResult === "succeeded";
  const showCheckoutCancelled =
    checkoutResult === "cancelled" || checkoutResult === "canceled";
  const showCheckoutFailed = checkoutResult === "failed";

  const activePackages = useMemo(
    () => packages.filter((pkg) => pkg.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [packages]
  );

  async function startCheckout(planId: PackageId) {
    try {
      setCheckoutPlan(planId);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          billingCycle: isAnnual ? "annual" : "monthly",
        }),
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? m.pricingUnableCheckout);
      }
      router.push(payload.url);
    } catch (error) {
      console.error(error);
      alert(m.pricingUnableCheckout);
    } finally {
      setCheckoutPlan(null);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(at 40% 20%, hsla(173, 100%, 76%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%)",
      }}
    >
      <MainSiteHeader active="pricing" />

      <main className="pt-32">
        {showCheckoutSuccess ? (
          <section className="mx-auto w-full max-w-7xl px-8 pt-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-900">
              <p className="text-sm font-semibold sm:text-base">
                {m.pricingPaymentReceivedTitle}
              </p>
              <p className="mt-1 text-xs text-emerald-800 sm:text-sm">
                {m.pricingPaymentReceivedBody}
              </p>
            </div>
          </section>
        ) : null}
        {showCheckoutCancelled ? (
          <section className="mx-auto w-full max-w-7xl px-8 pt-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900">
              <p className="text-sm font-semibold sm:text-base">
                {m.pricingCheckoutCancelledTitle}
              </p>
              <p className="mt-1 text-xs text-slate-700 sm:text-sm">
                {m.pricingCheckoutCancelledBody}
              </p>
            </div>
          </section>
        ) : null}
        {showCheckoutFailed ? (
          <section className="mx-auto w-full max-w-7xl px-8 pt-6">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-900">
              <p className="text-sm font-semibold sm:text-base">
                {m.pricingCheckoutFailedTitle}
              </p>
              <p className="mt-1 text-xs text-rose-800 sm:text-sm">
                {m.pricingCheckoutFailedBody}
              </p>
            </div>
          </section>
        ) : null}
        <section
          id="pricing-hero"
          className="mx-auto w-full max-w-7xl px-8 pb-20 pt-40 text-center"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
                {m.pricingHeroTitle}
              </h1>
              <p className="mx-auto mb-12 mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
                {m.pricingHeroSubtitle}
              </p>
            </div>

            <div className="mb-16 flex items-center justify-center space-x-4">
              <span
                className={`text-lg font-semibold ${
                  !isAnnual ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {m.pricingMonthly}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAnnual}
                aria-label={m.pricingToggleAria}
                onClick={() => setIsAnnual((prev) => !prev)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full border transition-colors duration-300 ${
                  isAnnual
                    ? "border-[#5eead4] bg-[#99f6e4]"
                    : "border-slate-300 bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-7 w-7 rounded-full border border-slate-200 bg-white shadow-sm transition-transform duration-300 ${
                    isAnnual ? "translate-x-8" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span
                className={`flex items-center text-lg font-semibold ${
                  isAnnual ? "text-slate-900" : "text-slate-600"
                }`}
              >
                {m.pricingAnnually}
                <span className="mt-1 block rounded-full border border-[#c6faf5] bg-[#ecfdfb] px-2 py-1 text-center text-sm font-bold text-[#0ea5b7] sm:ml-2 sm:mt-0 sm:inline-block">
                  {m.pricingSave20}
                </span>
              </span>
            </div>

            <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
              {activePackages.map((plan, index) => {
                const shownPrice = isAnnual
                  ? formatPrice(plan.annualPrice)
                  : formatPrice(plan.monthlyPrice);
                const priceSuffix = isAnnual
                  ? m.pricingSuffixYr
                  : m.pricingSuffixMo;
                const cardFeatures = getPackageCardBullets(plan);

                return (
                  <article
                    key={plan.id}
                    className={`relative flex flex-col items-center rounded-2xl p-8 ${
                      plan.featured
                        ? "border-2 border-[#11c4b6] shadow-lg md:-translate-y-4"
                        : "border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
                    }`}
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    {plan.featured ? (
                      <div className="absolute -top-4 rounded-full bg-[#11c4b6] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        {m.pricingMostPopular}
                      </div>
                    ) : null}
                    <div className="text-center">
                      <h3 className="mb-2 text-2xl font-bold text-slate-900">
                        {plan.name}
                      </h3>
                      <p className="mb-6 h-10 text-center text-sm text-slate-500">
                        {plan.subtitle}
                      </p>
                      <div className="mb-8 flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-slate-900">
                          {shownPrice}
                        </span>
                        <span className="ml-2 text-slate-500">{priceSuffix}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startCheckout(plan.id)}
                      disabled={checkoutPlan === plan.id}
                      className={`mb-8 w-full rounded-full px-6 text-center ${MARKETING_BUTTON_BASE} ${
                        plan.featured
                          ? "bg-[#11c4b6] text-white shadow-md hover:bg-[#0ea5b7]"
                          : index === 0
                            ? "border border-[#9ceee5] bg-white text-[#0ea5b7] hover:bg-[#ecfdfb]"
                            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {checkoutPlan === plan.id
                        ? m.pricingRedirecting
                        : m.pricingGetStarted}
                    </button>
                    <ul className="w-full space-y-4 text-left">
                      {cardFeatures.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <span className="mr-3 mt-0.5 text-[#11c4b6]">
                            <CheckCircleIcon className="h-4 w-4" />
                          </span>
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <div
              className="relative overflow-hidden rounded-3xl border border-[#baf4ec] p-8 text-center shadow-[0_20px_60px_-30px_rgba(17,196,182,0.45)] md:p-12"
              style={{
                background:
                  "linear-gradient(130deg, rgba(236,253,251,0.95) 0%, rgba(255,255,255,0.96) 45%, rgba(240,249,255,0.92) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#5eead4]/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-[#67e8f9]/30 blur-3xl" />

              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#0f766e]">
                {m.pricingTrialEyebrow}
              </p>
              <h3 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {m.pricingTrialTitle}
              </h3>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                {m.pricingTrialBody}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/book-demo" className={MARKETING_BUTTON_PRIMARY}>
                  {m.pricingBookDemo}
                </Link>
                <Link
                  href="/signup"
                  className={`${MARKETING_BUTTON_SECONDARY} border-[#9ceee5] text-[#0ea5b7] hover:bg-[#ecfdfb]`}
                >
                  {m.pricingStartTrial}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="comparison"
          className="mx-auto w-full max-w-7xl px-8 py-24"
        >
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">
              {m.pricingCompareTitle}
            </h2>
            <p className="text-lg text-slate-600">{m.pricingCompareSubtitle}</p>
          </div>

          <div
            className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="min-w-[260px] p-6 font-semibold text-slate-900">
                    {m.pricingTableFeature}
                  </th>
                  {activePackages.map((pkg) => (
                    <th
                      key={pkg.id}
                      className={`min-w-[120px] p-6 text-center font-semibold ${
                        pkg.featured ? "text-[#0ea5b7]" : "text-slate-900"
                      }`}
                    >
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisonSections.map((section, sectionIndex) =>
                  section.rows.length > 0 ? (
                    <Fragment key={section.category}>
                      <tr className="bg-slate-50/30">
                        <td
                          colSpan={activePackages.length + 1}
                          style={{
                            backgroundImage:
                              sectionIndex === 0
                                ? "linear-gradient(90deg, rgba(226, 253, 248, 0.8) 0%, rgba(240, 249, 255, 0.85) 50%, rgba(255, 241, 242, 0.75) 100%)"
                                : undefined,
                          }}
                          className="border-b border-t border-slate-200 p-4 font-bold uppercase text-slate-900"
                        >
                          {section.category}
                        </td>
                      </tr>
                      {section.rows.map((row, rowIndex) => (
                        <tr
                          key={row.key}
                          className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                            rowIndex % 2 === 1 ? "bg-slate-50/20" : ""
                          }`}
                        >
                          <td className="p-4 pl-6 text-slate-600">{row.label}</td>
                          {activePackages.map((pkg) => {
                            const value = row.values[pkg.id];
                            return (
                              <td
                                key={`${row.key}-${pkg.id}`}
                                className="p-4 text-center font-medium text-slate-900"
                              >
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <span className="inline-flex text-[#11c4b6]">
                                      <CheckCircleIcon className="h-4 w-4" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex text-slate-300">
                                      <XIcon className="h-4 w-4" />
                                    </span>
                                  )
                                ) : (
                                  value
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="faqs"
          className="border-t border-slate-100 bg-white px-8 py-24"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                {m.pricingFaqTitle}
              </h2>
              <p className="text-lg text-slate-600">{m.pricingFaqSubtitle}</p>
            </div>

            <div className="space-y-6">
              {pricingFaqs.map((faq) => (
                <div
                  key={faq.q}
                  className="cursor-pointer rounded-xl border border-slate-200 p-6 transition-colors hover:border-[#9ceee5]"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq((prev) => (prev === faq.q ? null : faq.q))
                    }
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={openFaq === faq.q}
                  >
                    <h4
                      className={`text-lg font-bold ${
                        openFaq === faq.q ? "text-[#0ea5b7]" : "text-slate-900"
                      }`}
                    >
                      {faq.q}
                    </h4>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform duration-200 ${
                        openFaq === faq.q
                          ? "rotate-180 text-[#11c4b6]"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                  {openFaq === faq.q ? (
                    <p className="mt-4 leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <MainSiteCta />
      </main>

      <MainSiteFooter />
    </div>
  );
}
