import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  messages,
  type Translations,
} from "./translations";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value ?? DEFAULT_LOCALE;
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE;
}

export async function getServerTranslations(): Promise<{
  locale: Locale;
  t: Translations;
}> {
  const locale = await getServerLocale();
  return { locale, t: messages[locale] };
}
