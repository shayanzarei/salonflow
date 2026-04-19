"use client";

import Link from "next/link";
import {
  MARKETING_BUTTON_GLASS,
  MARKETING_BUTTON_PRIMARY,
} from "@/components/marketing/buttonStyles";
import { useLocale } from "@/lib/i18n/context";

export default function MainSiteCta() {
  const { t } = useLocale();
  const w = t.website;
  return (
    <section
      id="final-cta"
      className="relative overflow-hidden bg-slate-900 px-8 py-32 text-center"
    >
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#11c4b6] opacity-20 mix-blend-multiply blur-[100px]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="mb-6 text-5xl font-bold tracking-tight text-white">
          {w.finalTitle}
        </h2>
        <p className="mb-10 text-xl text-slate-300">
          {w.finalBody}
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/signup"
            className={`${MARKETING_BUTTON_PRIMARY} w-full sm:w-auto`}
          >
            {w.finalTrial}
          </Link>
          <Link
            href="/book-demo"
            className={`${MARKETING_BUTTON_GLASS} w-full sm:w-auto`}
          >
            {w.finalDemo}
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          {w.finalMeta}
        </p>
      </div>
    </section>
  );
}
