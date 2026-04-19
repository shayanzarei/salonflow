"use client";

import { LocaleProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";
import { SessionProvider } from "next-auth/react";

export default function Providers({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
    </SessionProvider>
  );
}
