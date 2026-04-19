"use client";

import Link from "next/link";
import { MARKETING_BUTTON_PRIMARY } from "@/components/marketing/buttonStyles";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";

export default function MainSiteMobileStickyCta() {
  const { t } = useLocale();
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Link
        href="/signup"
        className={`${MARKETING_BUTTON_PRIMARY} w-full space-x-2 shadow-xl`}
      >
        <span>{t.website.stickyCta}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
