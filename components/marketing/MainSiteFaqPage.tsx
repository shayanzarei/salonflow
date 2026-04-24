"use client";

import MainSiteCta from "@/components/marketing/MainSiteCta";
import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import { ChevronDownIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import { useEffect, useState } from "react";

export default function MainSiteFaqPage() {
  const { t } = useLocale();
  const m = t.marketing;
  const faqSections = m.faqSections;
  const [openFaq, setOpenFaq] = useState<string | null>(
    () => faqSections[0]?.items[0]?.q ?? null
  );

  useEffect(() => {
    const first = faqSections[0]?.items[0]?.q ?? null;
    setOpenFaq((prev) => {
      const exists = faqSections.some((s) =>
        s.items.some((item) => item.q === prev)
      );
      return exists ? prev : first;
    });
  }, [faqSections]);

  return (
    <div className="min-h-screen bg-[#f8fcff] text-slate-900">
      <MainSiteHeader active="faq" />

      <main className="pt-32">
        <section
          id="faqs"
          className="border-t border-slate-100 bg-white px-8 py-24"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                {m.faqPageTitle}
              </h2>
              <p className="text-lg text-slate-600">{m.faqPageSubtitle}</p>
            </div>

            <div className="space-y-10">
              {faqSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.16em] text-brand-700">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.items.map((faq) => (
                      <div
                        key={faq.q}
                        className="cursor-pointer rounded-xl border border-slate-200 p-6 transition-colors hover:border-brand-200"
                        style={{
                          background: "rgba(255, 255, 255, 0.8)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenFaq((prev) =>
                              prev === faq.q ? null : faq.q
                            )
                          }
                          className="flex w-full items-center justify-between text-left"
                          aria-expanded={openFaq === faq.q}
                        >
                          <h4
                            className={`text-sm font-bold ${
                              openFaq === faq.q
                                ? "text-brand-700"
                                : "text-slate-900"
                            }`}
                          >
                            {faq.q}
                          </h4>
                          <ChevronDownIcon
                            className={`h-5 w-5 transition-transform duration-200 ${
                              openFaq === faq.q
                                ? "rotate-180 text-brand-600"
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
              ))}
            </div>
          </div>
        </section>
      </main>

      <MainSiteCta />
      <MainSiteFooter />
    </div>
  );
}
