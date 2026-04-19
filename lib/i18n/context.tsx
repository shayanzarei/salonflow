"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  type Locale,
  type Translations,
  messages,
} from "./translations";

// ── Context ────────────────────────────────────────────────────────────────────

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: messages[DEFAULT_LOCALE],
});

// ── Provider ───────────────────────────────────────────────────────────────────

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: messages[locale] }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/** Returns the current locale and the translation object for it. */
export function useLocale() {
  return useContext(LocaleContext);
}
