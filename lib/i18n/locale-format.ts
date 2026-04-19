import type { Locale } from "./translations";

/** BCP 47 tag for `Date#toLocale*` and `Intl` formatters. */
export function bcp47ForLocale(locale: Locale): string {
  return locale === "nl" ? "nl-NL" : "en-US";
}
