import MainSiteCta from "@/components/marketing/MainSiteCta";
import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    subtitle: "Perfect for getting started with your solo business.",
    cta: "Get Started Free",
    featured: false,
    features: [
      { label: "Up to 3 active clients", included: true },
      { label: "Basic invoicing", included: true },
      { label: "Standard proposals", included: true },
      { label: "Custom domain", included: false },
      { label: "Client portal", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$29",
    subtitle: "Everything you need to run a thriving solo practice.",
    cta: "Start 14-Day Free Trial",
    featured: true,
    features: [
      { label: "Unlimited clients", included: true, highlight: true },
      { label: "Advanced invoicing & recurring", included: true },
      { label: "Custom branded proposals", included: true },
      { label: "Custom domain mapping", included: true },
      { label: "Secure client portals", included: true },
    ],
  },
  {
    name: "Agency",
    price: "$79",
    subtitle: "For small teams and growing agencies.",
    cta: "Get Started",
    featured: false,
    features: [
      { label: "Everything in Pro", included: true, highlight: true },
      { label: "Up to 5 team members", included: true },
      { label: "Advanced team permissions", included: true },
      { label: "White-label branding", included: true },
      { label: "Priority 24/7 support", included: true },
    ],
  },
] as const;

const FAQS = [
  {
    q: "What happens when my trial ends?",
    a: "You can continue on the Free plan, or upgrade to keep advanced workflows and branding features.",
  },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel any paid subscription at any time with no lock-in." },
  { q: "Are there hidden fees for payments?", a: "No hidden platform fees. Standard payment processor fees may still apply." },
  { q: "Do you offer refunds?", a: "If you were billed in error, our team can help quickly." },
];

export default function MainSitePricingPage() {
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
        <section id="pricing-hero" className="mx-auto w-full max-w-7xl px-8 pb-20 pt-40 text-center">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
                Simple, transparent pricing
              </h1>
              <p className="mx-auto mb-12 mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
                Start free, upgrade when you need to. No hidden fees, ever.
              </p>
            </div>

            <div className="mb-16 flex items-center justify-center space-x-4">
              <span className="text-lg font-semibold text-slate-900">Monthly</span>
              <div className="relative inline-block h-8 w-16 align-middle">
                <input
                  type="checkbox"
                  className="absolute z-10 h-8 w-8 cursor-pointer appearance-none rounded-full border-4 border-slate-200 bg-white transition-transform duration-300 ease-in-out"
                />
                <label className="block h-8 cursor-pointer overflow-hidden rounded-full bg-slate-200" />
              </div>
              <span className="flex items-center text-lg font-semibold text-slate-600">
                Annually
                <span className="ml-2 rounded-full border border-[#c6faf5] bg-[#ecfdfb] px-2 py-1 text-sm font-bold text-[#0ea5b7]">
                  Save 20%
                </span>
              </span>
            </div>

            <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
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
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="mb-6 h-10 text-center text-sm text-slate-500">{plan.subtitle}</p>
                    <div className="mb-8 flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                      <span className="ml-2 text-slate-500">/mo</span>
                    </div>
                  </div>
                  <Link
                    href="/login"
                    className={`mb-8 w-full rounded-xl px-6 py-3 text-center font-bold transition-colors ${
                      plan.featured
                        ? "bg-[#11c4b6] text-white shadow-md hover:bg-[#0ea5b7]"
                        : plan.name === "Free"
                          ? "border border-[#9ceee5] bg-white text-[#0ea5b7] hover:bg-[#ecfdfb]"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="w-full space-y-4 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start">
                        <span
                          className={`mr-3 mt-1 text-sm ${
                            feature.included ? "text-[#11c4b6]" : "text-slate-300"
                          }`}
                        >
                          {feature.included ? "✓" : "✕"}
                        </span>
                        <span
                          className={`text-sm ${
                            feature.included
                              ? feature.highlight
                                ? "font-medium text-slate-900"
                                : "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/50 px-8 py-12 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl text-center">
            <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Trusted by 10,000+ independent professionals
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-900 opacity-50 grayscale transition-all duration-300 hover:grayscale-0 md:gap-16">
              <span className="text-3xl font-bold tracking-tight">stripe</span>
              <span className="text-3xl font-bold tracking-tight">PayPal</span>
              <span className="text-3xl font-bold tracking-tight">AWS</span>
              <span className="text-2xl font-semibold tracking-tight">Google</span>
              <span className="text-2xl font-semibold tracking-tight">Apple</span>
            </div>
          </div>
        </section>

        <section id="comparison" className="mx-auto w-full max-w-7xl px-8 py-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">Compare plans in detail</h2>
            <p className="text-lg text-slate-600">Find the perfect plan for your business needs.</p>
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
                  <th className="w-1/3 p-6 font-semibold text-slate-900">Features</th>
                  <th className="w-2/9 p-6 text-center font-semibold text-slate-900">Free</th>
                  <th className="w-2/9 p-6 text-center font-semibold text-[#0ea5b7]">Pro</th>
                  <th className="w-2/9 p-6 text-center font-semibold text-slate-900">Agency</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="bg-slate-50/30">
                  <td colSpan={4} className="border-b border-slate-200 p-4 font-bold text-slate-900">
                    Core Features
                  </td>
                </tr>
                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Active Clients</td>
                  <td className="p-4 text-center font-medium text-slate-900">3</td>
                  <td className="p-4 text-center font-medium text-slate-900">Unlimited</td>
                  <td className="p-4 text-center font-medium text-slate-900">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/20 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Projects</td>
                  <td className="p-4 text-center font-medium text-slate-900">10</td>
                  <td className="p-4 text-center font-medium text-slate-900">Unlimited</td>
                  <td className="p-4 text-center font-medium text-slate-900">Unlimited</td>
                </tr>

                <tr className="bg-slate-50/30">
                  <td colSpan={4} className="border-b border-t border-slate-200 p-4 font-bold text-slate-900">
                    Billing &amp; Invoicing
                  </td>
                </tr>
                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Standard Invoices</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/20 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Recurring Subscriptions</td>
                  <td className="p-4 text-center text-slate-300">—</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                </tr>
                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Payment Gateway Fees</td>
                  <td className="p-4 text-center font-medium text-slate-900">Standard + 1%</td>
                  <td className="p-4 text-center font-medium text-slate-900">Standard (0% markup)</td>
                  <td className="p-4 text-center font-medium text-slate-900">Standard (0% markup)</td>
                </tr>

                <tr className="bg-slate-50/30">
                  <td colSpan={4} className="border-b border-t border-slate-200 p-4 font-bold text-slate-900">
                    Branding &amp; Portals
                  </td>
                </tr>
                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Remove SoloHub Branding</td>
                  <td className="p-4 text-center text-slate-300">—</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/20 transition-colors hover:bg-slate-50/50">
                  <td className="p-4 pl-6 text-slate-600">Custom Domain</td>
                  <td className="p-4 text-center text-slate-300">—</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                  <td className="p-4 text-center text-[#11c4b6]">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="faqs" className="border-t border-slate-100 bg-white px-8 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-600">Everything you need to know about billing and plans.</p>
            </div>

            <div className="space-y-6">
              <div
                className="cursor-pointer rounded-xl border border-slate-200 p-6 transition-colors hover:border-[#9ceee5]"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900">What happens when my trial ends?</h4>
                  <span className="text-slate-400">⌄</span>
                </div>
              </div>

              <div
                className="rounded-xl border border-[#9ceee5] p-6 shadow-md"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-[#0ea5b7]">Can I cancel my subscription at any time?</h4>
                  <span className="text-[#11c4b6]">⌃</span>
                </div>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Yes, absolutely. There are no long-term contracts or cancellation fees.
                  If you cancel, you&apos;ll retain access to your paid features until the end
                  of your current billing cycle.
                </p>
              </div>

              {FAQS.filter((faq) => faq.q !== "What happens when my trial ends?" && faq.q !== "Can I cancel anytime?").map((faq) => (
                <div
                  key={faq.q}
                  className="cursor-pointer rounded-xl border border-slate-200 p-6 transition-colors hover:border-[#9ceee5]"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">{faq.q}</h4>
                    <span className="text-slate-400">⌄</span>
                  </div>
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
