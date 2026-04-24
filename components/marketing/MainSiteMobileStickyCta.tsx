"use client";

import Link from "next/link";
import { Button } from "@/components/ds/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";

export default function MainSiteMobileStickyCta() {
  const { t } = useLocale();
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Button asChild variant="primary" size="xl" className="w-full shadow-xl">
        <Link href="/signup">
          <span>{t.website.stickyCta}</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
