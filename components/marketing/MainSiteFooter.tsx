"use client";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";

export default function MainSiteFooter() {
  const { t } = useLocale();
  const f = t.footer;

  return (
    <footer
      id="footer"
      className="border-t border-slate-100 bg-white px-8 pb-10 pt-20"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4 md:gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link
            href="/"
            className="mb-6 inline-flex items-center"
            aria-label="Go to SoloHub home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
              alt="SoloHub"
              className="h-14 w-auto"
            />
          </Link>
          <p className="mb-6 text-sm text-slate-500">{f.tagline}</p>
          <div className="flex space-x-4 text-slate-400">
            <a href="#" className="transition-colors hover:text-[#11c4b6]">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href="#" className="transition-colors hover:text-[#11c4b6]">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href="#" className="transition-colors hover:text-[#11c4b6]">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-slate-900">{f.product}</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>
              <Link
                href="/pricing"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                {f.pricing}
              </Link>
            </li>
            <li>
              <Link
                href="/book-demo"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                {f.demo}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-slate-900">{f.resources}</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>
              <Link
                href="/blog"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                {f.blog}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-[#0ea5b7]">
                {f.faqs}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-slate-900">{f.company}</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li>
              <Link
                href="/about"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                {f.about}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                {f.contact}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-[#0ea5b7]"
              >
                {f.privacyTerms}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between border-t border-slate-100 pt-8 text-sm text-slate-400 md:flex-row">
        <p>{f.copyright}</p>
        <div className="mt-4 flex space-x-6 md:mt-0">
          <Link href="/privacy" className="hover:text-slate-600">
            {f.privacyPolicy}
          </Link>
          <Link href="/terms" className="hover:text-slate-600">
            {f.termsOfService}
          </Link>
        </div>
      </div>
    </footer>
  );
}
