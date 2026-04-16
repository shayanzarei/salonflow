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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";

const FAQS = [
  {
    q: "Is this price inclusive of VAT?",
    a: "As is standard for B2B SaaS in the Netherlands, all prices are displayed excluding 21% BTW.",
  },
  {
    q: "Can each staff member have their own login?",
    a: "Yes. Starting from our Hub plan, each team member gets a dedicated staff portal to manage their own schedules.",
  },
  {
    q: 'What is the "Locked for Life" promise?',
    a: "Early adopters are protected from future price increases. If you sign up during our launch phase, your monthly rate will stay the same even as we add more features.",
  },
  {
    q: "Do you charge commission on my bookings?",
    a: "No. Unlike competitors who take a percentage of your new clients, SoloHub charges a flat monthly fee so you keep 100% of your earnings.",
  },
  {
    q: "Do I need a credit card to start my 14-day trial?",
    a: "No. You can set up your website and start taking bookings immediately without entering any payment details.",
  },
  {
    q: "How easy is it to move my data from another tool?",
    a: "If you are currently using WhatsApp, paper, or another platform like Fresha, we provide migration assistance to help you move your core data quickly.",
  },
  {
    q: "Can my staff see my business revenue?",
    a: "No. Staff access is limited to their own schedule and notes. Sensitive financial data stays restricted to the owner dashboard.",
  },
  {
    q: "Do I need to buy a separate domain for my website?",
    a: "Every plan includes a free solohub.io subdomain. If your package includes custom domain support, you can connect your own brand domain too.",
  },
  {
    q: "Is there really no fee for new clients?",
    a: "Correct. SoloHub is a management tool, not a commission marketplace. You pay a flat monthly fee and keep every cent you earn.",
  },
] as const;

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
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(FAQS[0]?.q ?? null);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

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
        throw new Error(payload.error ?? "Unable to start checkout.");
      }
      router.push(payload.url);
    } catch (error) {
      console.error(error);
      alert("Unable to start checkout. Please try again.");
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
        <section
          id="pricing-hero"
          className="mx-auto w-full max-w-7xl px-8 pb-20 pt-40 text-center"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
                Simple, Professional Pricing
              </h1>
              <p className="mx-auto mb-12 mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
                No commission, no hidden fees. All prices exclude 21% BTW.
              </p>
            </div>

            <div className="mb-16 flex items-center justify-center space-x-4">
              <span
                className={`text-lg font-semibold ${
                  !isAnnual ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAnnual}
                aria-label="Toggle annual pricing"
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
                Annually
                <span className="mt-1 block rounded-full border border-[#c6faf5] bg-[#ecfdfb] px-2 py-1 text-center text-sm font-bold text-[#0ea5b7] sm:ml-2 sm:mt-0 sm:inline-block">
                  Save 20%
                </span>
              </span>
            </div>

            <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
              {activePackages.map((plan, index) => {
                const shownPrice = isAnnual
                  ? formatPrice(plan.annualPrice)
                  : formatPrice(plan.monthlyPrice);
                const priceSuffix = isAnnual ? "/yr" : "/mo";
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
                        Most Popular
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
                      {checkoutPlan === plan.id ? "Redirecting..." : "Get Started"}
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
                Why a 14-day trial?
              </p>
              <h3 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                See the value first, then decide with confidence
              </h3>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                We want you to experience exactly how much time SoloHub saves
                before you pay a cent. During your trial, you get full access to
                your professional website, automated reminders, and staff
                portals. If it&apos;s not the perfect fit, you can walk away
                anytime, no questions asked.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/book-demo" className={MARKETING_BUTTON_PRIMARY}>
                  Book a Demo
                </Link>
                <Link
                  href="/signup"
                  className={`${MARKETING_BUTTON_SECONDARY} border-[#9ceee5] text-[#0ea5b7] hover:bg-[#ecfdfb]`}
                >
                  Start Free Trial
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
              Compare plans in detail
            </h2>
            <p className="text-lg text-slate-600">
              Find the perfect plan for your business needs.
            </p>
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
                    Feature
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
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600">
                Everything you need to know about billing and plans.
              </p>
            </div>

            <div className="space-y-6">
              {FAQS.map((faq) => (
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
