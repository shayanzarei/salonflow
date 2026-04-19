"use client";

import { ArrowRightIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { MARKETING_BUTTON_DARK } from "@/components/marketing/buttonStyles";
import { useLocale } from "@/lib/i18n/context";

export default function MainSiteAbout() {
  const { t } = useLocale();
  const w = t.website;
  return (
    <section
      id="about-story"
      className="bg-gradient-to-br from-[#ecfdfb] to-white px-8 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/2">
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="h-auto w-full rounded-xl object-cover"
                src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/IMG_7337%20%281%29.jpg"
                alt="Shayan and Aryana"
              />
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-6 inline-block rounded-full bg-[#ccfbf1] px-4 py-2 text-sm font-semibold text-[#0ea5b7]">
              <span className="mr-2">🇳🇱</span>
              {w.aboutBadge}
            </div>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              {w.aboutTitle}
            </h2>
            <p className="mb-6 text-xl leading-relaxed text-slate-600">
              {w.aboutBody1}
            </p>
            <p className="mb-8 text-lg leading-relaxed text-slate-600">
              {w.aboutBody2}
            </p>
            <div className="flex flex-col gap-8 sm:flex-row">
              <Link
                href="/about"
                className={`${MARKETING_BUTTON_DARK} space-x-2`}
              >
                <span>{w.aboutCta}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <div className="flex items-center -space-x-2 px-6">
                {/* Your Profile Image */}
                <img
                  src="https://lh3.googleusercontent.com/a/ACg8ocIdY9K-5grmtCyN542fzz2HWDPJeIvL6NvpMs8k7aUqJOwGnKA=s288-c-no"
                  className="h-12 w-12 rounded-full border-2 border-white shadow-md z-20"
                  alt="Shayan Zarei"
                />
                {/* Her Profile Image */}
                <img
                  src="https://media.licdn.com/dms/image/v2/D4E03AQFWxq6hTS1UPA/profile-displayphoto-shrink_200_200/B4EZTIfdajGYAc-/0/1738530478335?e=1778112000&v=beta&t=uD8lxGIibO7-XFicbe3s46vwTYfValY04mWA2S5hnL8"
                  className="h-12 w-12 rounded-full border-2 border-white shadow-md z-10"
                  alt="Partner Name"
                />

                <div className="text-left pl-6">
                  <p className="text-sm font-semibold text-slate-900">
                    Shayan & Aryana
                  </p>
                  <p className="text-xs text-slate-500">
                    {w.aboutFounderRole}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 border-t border-slate-200 pt-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                <div className="text-center sm:text-left">
                  <div className="mb-1 text-xl font-bold text-[#0ea5b7]">
                    {w.stat1Title}
                  </div>
                  <div className="text-sm text-slate-600">{w.stat1Body}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="mb-1 text-xl font-bold text-[#0ea5b7]">
                    {w.stat2Title}
                  </div>
                  <div className="text-sm text-slate-600">{w.stat2Body}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="mb-1 text-xl font-bold text-[#0ea5b7]">
                    2026
                  </div>
                  <div className="text-sm text-slate-600">{w.stat3Body}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
