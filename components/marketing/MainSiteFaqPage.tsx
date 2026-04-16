"use client";

import MainSiteCta from "@/components/marketing/MainSiteCta";
import MainSiteFooter from "@/components/marketing/MainSiteFooter";
import MainSiteHeader from "@/components/marketing/MainSiteHeader";
import { ChevronDownIcon } from "@/components/ui/Icons";
import { useState } from "react";

const FAQ_SECTIONS = [
  {
    title: "1. Switching from Fresha or Salonized",
    items: [
      {
        q: "How easy is it to switch from Fresha or Salonized?",
        a: "It is incredibly simple. We offer a free migration service where we help you manually move your client list and service data to SoloHub. Most businesses are up and running in less than 10 minutes.",
      },
      {
        q: "Will you suddenly change your prices like other platforms?",
        a: "No. We have a Locked for Life promise for our Early Bird members. Our trust pledge also guarantees that we will never change pricing without at least 6 months prior notice.",
      },
      {
        q: "Do you charge a commission fee per booking?",
        a: "Absolutely not. Unlike marketplaces that can take up to 20% of your revenue, SoloHub is a management tool with a flat monthly fee. You keep 100% of what you earn.",
      },
    ],
  },
  {
    title: "2. Pricing and Plans",
    items: [
      {
        q: "Do your prices include BTW (VAT)?",
        a: "As standard for B2B services in the Netherlands, prices shown on our website exclude 21% BTW. This is clearly calculated and added on your monthly invoice.",
      },
      {
        q: "What is a Founding Member or Early Bird account?",
        a: "These are special accounts for our first 200 customers. By joining early, you lock in a significantly lower monthly rate for the lifetime of your account.",
      },
      {
        q: "Can I pay annually to save money?",
        a: "Yes. Choosing annual billing saves you approximately 20% compared to paying monthly.",
      },
    ],
  },
  {
    title: "3. Features and Team Management",
    items: [
      {
        q: "Can each of my staff members have their own login?",
        a: "Yes. Starting with the Hub plan, you can have up to 5 staff members, each with their own dedicated staff portal login and personal schedule.",
      },
      {
        q: "Does the automated reminder system really prevent no-shows?",
        a: "Yes. Our system sends reminders at 48h, 24h, and 2h before each appointment. For most users, preventing even one no-show per month covers the software cost.",
      },
      {
        q: "Can I use my own custom domain for the website?",
        a: "All plans include a free solohub.io subdomain. Our Pro plan lets you connect your own custom domain (for example, www.jouwsalon.nl) for a fully professional look.",
      },
    ],
  },
  {
    title: "4. Trust, Legal and Support",
    items: [
      {
        q: "Is SoloHub a Dutch company?",
        a: "Yes. SoloHub B.V. is fully registered with the Dutch Chamber of Commerce (KVK). We are built in the Netherlands specifically for the Dutch service market.",
      },
      {
        q: "How do you handle data and privacy (AVG/GDPR)?",
        a: "We take AVG compliance seriously. Personal data is hosted on secure EU servers (Frankfurt). We also provide a formal Data Processing Agreement (DPA/Verwerkersovereenkomst) in our terms.",
      },
      {
        q: "What kind of support do you offer?",
        a: "You get a direct line to the founders. We aim to respond to every support ticket within 2 hours during Dutch business hours. No chatbots, just real people who built the tool.",
      },
    ],
  },
  {
    title: "5. Trial and Cancellation",
    items: [
      {
        q: "Do I need a credit card to start the trial?",
        a: "No. You can try SoloHub for 14 days without entering any credit card details.",
      },
      {
        q: "What happens if I want to cancel?",
        a: "You can cancel anytime with no hidden fees or long-term contracts. You keep access to your features until the end of your current billing period.",
      },
    ],
  },
] as const;

export default function MainSiteFaqPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(
    FAQ_SECTIONS[0].items[0].q
  );

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
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600">
                Got a question about SoloHub? Whether you’re a solo professional
                looking to save time on admin or managing a growing team, you’ll
                find the answers here. No chatbots—just honest answers from the
                founders.{" "}
              </p>
            </div>

            <div className="space-y-10">
              {FAQ_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.16em] text-[#0ea5b7]">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.items.map((faq) => (
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
                                ? "text-[#0ea5b7]"
                                : "text-slate-900"
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
