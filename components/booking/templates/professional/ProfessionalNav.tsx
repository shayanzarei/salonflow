"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState } from "react";

export interface ProfessionalNavLink {
  label: string;
  href: string;
}

/**
 * Header for the Professional template: thin contact bar, a centred wordmark,
 * the navigation, and the NL/EN switcher. Client component so the mobile menu
 * can toggle and the language switcher (which needs the locale context) can
 * live in the header. All labels arrive pre-resolved for the active locale —
 * the server component owns translation.
 */
export function ProfessionalNav({
  salonName,
  logoUrl,
  tagline,
  links,
  bookLabel,
  bookHref,
  contactBar,
}: {
  salonName: string;
  logoUrl: string | null;
  tagline: string;
  links: ProfessionalNavLink[];
  bookLabel: string;
  bookHref: string;
  contactBar: { address: string | null; phone: string | null; phone2: string; email: string };
}) {
  const [open, setOpen] = useState(false);

  const contactItems = [
    contactBar.address,
    contactBar.phone,
    contactBar.phone2 || null,
    contactBar.email || null,
  ].filter(Boolean) as string[];

  return (
    <header className="sticky top-0 z-40">
      {/* Top contact bar */}
      {contactItems.length > 0 && (
        <div
          className="px-4 py-2 text-[11px] tracking-[0.12em] text-white/90 sm:px-8"
          style={{ background: "var(--pro-taupe)" }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:justify-start">
            {contactItems.map((item) => (
              <span key={item} className="uppercase">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="border-b border-[var(--pro-line)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          {/* Left: language switcher (desktop) / menu button (mobile) */}
          <div className="flex flex-1 items-center justify-start">
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center text-[var(--pro-ink)] lg:hidden"
            >
              <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
            </button>
            <div className="hidden lg:block">
              <LanguageSwitcher variant="light" />
            </div>
          </div>

          {/* Center: wordmark */}
          <a href="/" className="flex shrink-0 flex-col items-center gap-1 no-underline">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={salonName} className="h-12 w-auto object-contain sm:h-14" />
            ) : (
              <span
                className="text-2xl uppercase tracking-[0.22em] text-[var(--pro-ink)] sm:text-3xl"
                style={{ fontFamily: "var(--font-pro-serif)" }}
              >
                {salonName}
              </span>
            )}
            {tagline && (
              <span className="text-[9px] uppercase tracking-[0.34em] text-[var(--pro-muted)]">
                {tagline}
              </span>
            )}
          </a>

          {/* Right: book CTA (desktop) */}
          <div className="flex flex-1 items-center justify-end">
            <a
              href={bookHref}
              className="hidden rounded-none px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white no-underline transition-opacity hover:opacity-90 lg:inline-block"
              style={{ background: "var(--pro-taupe)" }}
            >
              {bookLabel}
            </a>
          </div>
        </div>

        {/* Desktop nav row */}
        <nav className="hidden border-t border-[var(--pro-line)] lg:block">
          <ul className="mx-auto flex max-w-6xl items-center justify-center gap-10 px-4 py-3.5">
            {links.map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <a
                  href={link.href}
                  className="text-[12px] uppercase tracking-[0.14em] text-[var(--pro-ink)] no-underline transition-colors hover:text-[var(--pro-gold)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-b border-[var(--pro-line)] bg-white lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href} className="border-b border-[var(--pro-line)] last:border-0">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-[13px] uppercase tracking-[0.14em] text-[var(--pro-ink)] no-underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between px-4 py-4">
            <LanguageSwitcher variant="light" />
            <a
              href={bookHref}
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white no-underline"
              style={{ background: "var(--pro-taupe)" }}
            >
              {bookLabel}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
