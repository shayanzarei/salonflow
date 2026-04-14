"use client";

import { XIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Services", hash: "services" },
  { label: "Team", hash: "team" },
  { label: "Reviews", hash: "reviews" },
  { label: "About", hash: "about" },
];

type Props = {
  brand: string;
  salonName: string;
  salonLogoUrl?: string | null;
  bookHref: string;
};

export function BookingPublicNav({
  brand,
  salonName,
  salonLogoUrl,
  bookHref,
}: Props) {
  const [open, setOpen] = useState(false);
  const homeHref = "/";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Dims page behind menu so drawer reads as an overlay (mobile only) */}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-5 md:px-8">
          <Link
            href={homeHref}
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-bold text-white sm:h-10 sm:w-10"
              style={{ background: salonLogoUrl ? "transparent" : brand }}
            >
              {salonLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={salonLogoUrl}
                  alt={`${salonName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                salonName.charAt(0)
              )}
            </div>
            <span className="truncate text-sm font-semibold text-gray-900 sm:text-base">
              {salonName}
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {LINKS.map((item) => (
              <Link
                key={item.hash}
                href={`/#${item.hash}`}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href={bookHref}
              className="rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5"
              style={{ background: brand }}
            >
              Book now
            </Link>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? (
                <XIcon size={18} color="#374151" />
              ) : (
                <span className="flex flex-col gap-1" aria-hidden>
                  <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
                  <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
                  <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
                </span>
              )}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] md:hidden">
            <ul className="flex flex-col gap-1">
              {LINKS.map((item) => (
                <li key={item.hash}>
                  <Link
                    href={`/#${item.hash}`}
                    className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-gray-800 hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href={bookHref}
                  className="flex min-h-12 items-center justify-center rounded-full text-base font-semibold text-white"
                  style={{ background: brand }}
                  onClick={() => setOpen(false)}
                >
                  Book now
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
      </nav>
    </>
  );
}
